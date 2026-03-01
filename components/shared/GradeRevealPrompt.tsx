interface Props {
  title: string;
  subtitle: string;
  loadingMessage: string;
  buttonText: string;
  buttonColor: string;
  buttonTextColor?: string;
  onReveal: () => void;
}

export default function GradeRevealPrompt({
  title, subtitle, loadingMessage, buttonText, buttonColor, buttonTextColor = 'black', onReveal,
}: Props) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">{title}</h1>
      <p className="text-[#64748b] text-sm mb-6">{subtitle}</p>
      <div className="text-center py-16">
        <div className="text-[#64748b] text-sm mb-6">{loadingMessage}</div>
        <button
          onClick={onReveal}
          className="px-10 py-4 font-black rounded-xl text-lg transition-colors animate-pulse"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
