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
  aiTeamName?: string; // city name for flavored dialogue
}

function totalValue(players: Array<{ rating: number; salary: number; yearsLeft: number }>): number {
  return players.reduce((sum, p) => {
    const efficiency = p.rating / Math.max(p.salary, 5);
    return sum + p.rating * 0.6 + efficiency * 10 + p.yearsLeft * 1.5;
  }, 0);
}

function totalPickValue(picks: Array<{ year: number; value: number }>): number {
  return picks.reduce((sum, p) => sum + p.value * 4, 0);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function evaluateTrade(proposal: TradeProposal): AIEvaluation {
  const studentGivingValue = totalValue(proposal.studentGives) + totalPickValue(proposal.picksStudentGives);
  const studentReceivingValue = totalValue(proposal.studentReceives) + totalPickValue(proposal.picksStudentReceives);

  // AI team gets what student GIVES, student gets what student RECEIVES
  const aiValueGained = studentGivingValue;
  const aiValueLost = studentReceivingValue;
  const ratio = aiValueGained / Math.max(aiValueLost, 1);
  const gmName = proposal.aiTeamName ? `${proposal.aiTeamName} GM` : 'Our front office';

  // Check needs fit — does what student gives help the AI team's needs?
  const needsFit = proposal.studentGives.some(p =>
    proposal.aiTeamNeeds.some(need => p.name.toLowerCase().includes(need.toLowerCase()))
  );

  const needLabel = proposal.aiTeamNeeds[0] || 'better pieces';

  if (ratio >= 1.1 && needsFit) {
    const acceptReasons = [
      `This works for us. We're getting fair value and it addresses our ${needLabel} need. Deal.`,
      `${gmName} approves. The value is there and you're giving us exactly what we need.`,
      `We've run the numbers — this trade helps our rebuild. You've got a deal.`,
      `This is fair. We get our ${needLabel} and the salaries line up. Let's get this done.`,
      `Good negotiating. You found the price and met it. We accept.`,
      `Our analytics team likes this one. Fair value, good fit. Accepted.`,
      `You read us correctly. ${needLabel} is exactly what we needed. We're in.`,
      `Smart offer. You gave us what we asked for and the math works. Shaking hands.`,
    ];
    return {
      decision: 'Accept',
      reason: pickRandom(acceptReasons),
      confidenceScore: Math.min(95, Math.round(ratio * 60)),
    };
  }

  if (ratio >= 0.85 && ratio < 1.1) {
    if (!needsFit) {
      const counterReasons = [
        `The value is close but you're not giving us our ${needLabel}. Restructure this.`,
        `Interesting offer. The numbers are nearly there but we need ${needLabel} in this deal.`,
        `${gmName} says: close, but not quite. We need ${needLabel} to pull the trigger.`,
        `We can almost make this work. Send us a ${needLabel} and we revisit.`,
        `You're in the ballpark on value but missing what we actually need: ${needLabel}.`,
      ];
      return {
        decision: 'Counter',
        reason: pickRandom(counterReasons),
        counterOffer: {
          requestAdditional: proposal.aiTeamNeeds,
          message: `Swap out a piece and add ${needLabel} and we'll sign off on it.`,
        },
        confidenceScore: 45,
      };
    }
    const acceptNearReasons = [
      `Fair trade. Close to even value and it helps our roster. We accept.`,
      `We'll take it. Not our best deal, but it moves us in the right direction.`,
      `${gmName} signs off. The fit is right and value is close enough.`,
      `This works. It's not a win-win but it's fair. Done.`,
    ];
    return {
      decision: 'Accept',
      reason: pickRandom(acceptNearReasons),
      confidenceScore: 60,
    };
  }

  if (ratio < 0.85) {
    const deficit = ((aiValueLost - aiValueGained) / Math.max(aiValueLost, 1) * 100).toFixed(0);
    const rejectReasons = [
      `You're getting significantly more value than you're giving. We need more.`,
      `${gmName} laughed at this one. We'd be losing ${deficit}% of the value. Not happening.`,
      `This doesn't come close. Add picks or a better player and come back.`,
      `Our front office isn't interested at this price. You're low-balling us.`,
      `We didn't get into this business to lose trades. Come back with a real offer.`,
      `The return doesn't justify what we'd be giving up. Add first-round picks.`,
      `This is the opening offer? We expected better. ${deficit}% value deficit is too much.`,
      `Not a chance. Add picks, upgrade the player, or both — then we'll talk.`,
      `${gmName} says no. You kept the best pieces and sent us the scraps.`,
    ];
    return {
      decision: 'Reject',
      reason: pickRandom(rejectReasons),
      counterOffer: {
        requestAdditional: ['first-round pick', ...proposal.aiTeamNeeds],
        message: `Add a first-round pick and ${needLabel}, then we'd revisit this conversation.`,
      },
      confidenceScore: 20,
    };
  }

  return {
    decision: 'Counter',
    reason: `Interesting offer. ${gmName} wants to adjust the pieces slightly to make this work for both sides.`,
    counterOffer: {
      requestAdditional: proposal.aiTeamNeeds,
      message: `Let's restructure this. We need ${needLabel} to make it work on our end.`,
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
