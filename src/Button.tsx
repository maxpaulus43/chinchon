interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  highlight?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  disabled,
  onClick,
  highlight,
}) => {
  return disabled ? (
    <button
      className="bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed m-1"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  ) : (
    <button
      className={`bg-blue-500 hover:bg-blue-700 text-white m-1 font-bold py-2 px-4 rounded ${highlight ? "bg-yellow-500 hover:bg-yellow-500" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
