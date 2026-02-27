// AI GM trade evaluation logic

export interface AIEvaluation {
  decision: 'Accept' | 'Reject' | 'Counter';
  reason: string;
  counterOffer?: {
    requestAdditional: string[];
    removeRequested?: string[];
    message: string;
  };
  confidenceScore: number; // 0-100: how good was this trade for AI team
}

export interface TradeProposal {
  studentGives: Array<{ name: string; salary: number; rating: number; yearsLeft: number }>;
  studentReceives: Array<{ name: string; salary: number; rating: number; yearsLeft: number }>;
  picksStudentGives: Array<{ year: number; value: number }>;
  picksStudentReceives: Array<{ year: number; value: number }>;
  aiTeamNeeds: string[];
}

function totalValue(players: Array<{ rating: number; salary: number; yearsLeft: number }>): number {
  return players.reduce((sum, p) => {
    const efficiency = p.rating / Math.max(p.salary, 5);
    return sum + p.rating * 0.6 + efficiency * 10 + p.yearsLeft * 1.5;
  }, 0);
}

function totalPickValue(picks: Array<{ year: number; value: number }>): number {
  return picks.reduce((sum, p) => sum + p.value * 4, 0); // each pick point worth ~4 value units
}

export function evaluateTrade(proposal: TradeProposal): AIEvaluation {
  const studentGivingValue = totalValue(proposal.studentGives) + totalPickValue(proposal.picksStudentGives);
  const studentReceivingValue = totalValue(proposal.studentReceives) + totalPickValue(proposal.picksStudentReceives);

  // AI team gets what student GIVES, student gets what student RECEIVES
  const aiValueGained = studentGivingValue;
  const aiValueLost = studentReceivingValue;
  const ratio = aiValueGained / Math.max(aiValueLost, 1);

  // Check needs fit
  const needsFit = proposal.studentReceives.some(p =>
    proposal.aiTeamNeeds.some(need => p.name.toLowerCase().includes(need.toLowerCase()))
  );

  if (ratio >= 1.1 && needsFit) {
    return {
      decision: 'Accept',
      reason: `This works for us. We\'re getting fair value and it addresses our ${proposal.aiTeamNeeds[0]} need.`,
      confidenceScore: Math.min(95, Math.round(ratio * 60)),
    };
  }

  if (ratio >= 0.85 && ratio < 1.1) {
    if (!needsFit) {
      return {
        decision: 'Counter',
        reason: `The value is close but doesn\'t address our needs. We need ${proposal.aiTeamNeeds[0] || 'different pieces'}.`,
        counterOffer: {
          requestAdditional: proposal.aiTeamNeeds,
          message: `Add a ${proposal.aiTeamNeeds[0] || 'better fit'} and we\'ll talk.`,
        },
        confidenceScore: 45,
      };
    }
    return {
      decision: 'Accept',
      reason: 'Fair trade. Close to even value and helps our roster.',
      confidenceScore: 60,
    };
  }

  if (ratio < 0.85) {
    const deficit = ((aiValueLost - aiValueGained) / aiValueLost * 100).toFixed(0);
    const reasons = [
      `You\'re getting significantly more value than you\'re giving. We need more.`,
      `We\'d be losing ${deficit}% of the value in this deal. Not happening.`,
      `The return doesn\'t justify trading a player at this point in our rebuild.`,
      `Our front office isn\'t interested at this price. Add picks or a better player.`,
    ];
    return {
      decision: 'Reject',
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      counterOffer: {
        requestAdditional: ['draft pick', ...proposal.aiTeamNeeds],
        message: `If you add a first-round pick and ${proposal.aiTeamNeeds[0] || 'better salary filler'}, we\'d revisit.`,
      },
      confidenceScore: 20,
    };
  }

  return {
    decision: 'Counter',
    reason: 'Interesting offer. We want to adjust the pieces slightly.',
    counterOffer: {
      requestAdditional: proposal.aiTeamNeeds,
      message: 'Let\'s restructure this to work for both sides.',
    },
    confidenceScore: 50,
  };
}

export function calculateMultiFactorScore(params: {
  valueAcquired: number; // 0-10
  capEfficiency: number; // 0-10
  futureAssets: number; // picks retained 0-10
}): { total: number; grade: string; breakdown: Record<string, number> } {
  const weights = { valueAcquired: 0.4, capEfficiency: 0.3, futureAssets: 0.3 };
  const total = Math.round(
    params.valueAcquired * weights.valueAcquired * 10 +
    params.capEfficiency * weights.capEfficiency * 10 +
    params.futureAssets * weights.futureAssets * 10
  );

  let grade = 'F';
  if (total >= 90) grade = 'A+';
  else if (total >= 85) grade = 'A';
  else if (total >= 80) grade = 'A-';
  else if (total >= 75) grade = 'B+';
  else if (total >= 70) grade = 'B';
  else if (total >= 65) grade = 'B-';
  else if (total >= 60) grade = 'C+';
  else if (total >= 55) grade = 'C';
  else if (total >= 50) grade = 'C-';
  else if (total >= 40) grade = 'D';

  return {
    total,
    grade,
    breakdown: {
      valueAcquired: Math.round(params.valueAcquired * 10),
      capEfficiency: Math.round(params.capEfficiency * 10),
      futureAssets: Math.round(params.futureAssets * 10),
    },
  };
}
