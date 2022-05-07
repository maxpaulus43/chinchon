interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  highlight?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, disabled, onClick }) => {
  return (
    <button
      className={`bg-orange-500 text-white py-2 px-4 m-1 rounded ${
        disabled ? "opacity-80 cursor-not-allowed" : "hover:bg-orange-700"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
