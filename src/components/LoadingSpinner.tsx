interface Props {
    visible: boolean;
}

export const LoadingSpinner = ({ visible }: Props) => {
    if (!visible) return null;

    return (
        <div className="mt-20 flex flex-col items-center justify-center p-10 gap-6 animate-in fade-in duration-1000">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 border-r-transparent border-b-violet-600 border-l-transparent animate-spin duration-[2000]" />
                <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-purple-400 border-b-transparent border-l-purple-400 animate-spin-reverse" />
                <div className="absolute inset-6 bg-violet-600 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-pulse" />
            </div>

            <div className="text-center">
                <h3 className="text-violet-600 font-black text-xl uppercase">
                    Processando PDF...
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">
                    Extraindo texto e preparando a leitura
                </p>
            </div>
        </div>
    );
};