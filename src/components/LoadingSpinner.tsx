interface Props {
    visible: boolean;
}

export const LoadingSpinner = ({ visible }: Props) => {
    if (!visible) return null;

    return (
        <div className="loading-container">
            <div className="loading-spinner-wrapper">
                <div className="loading-spinner-outer" />
                <div className="loading-spinner-middle" />
                <div className="loading-spinner-core" />
            </div>

            <div className="loading-text-wrapper">
                <h3 className="loading-title">
                    Processando PDF...
                </h3>
                <p className="loading-subtitle">
                    Extraindo texto e preparando a leitura
                </p>
            </div>
        </div>
    );
};