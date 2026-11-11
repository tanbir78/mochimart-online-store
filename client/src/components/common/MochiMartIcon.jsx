

const MochiMartIcon = ({ size = 55, className = "" }) => {
    return (
        <img
            src="/images/icon.png"
            alt="MochiMart Icon"
            width={size}
            height={size}
            className={`object-contain ${className}`}
        />
    );
};

export default MochiMartIcon;
