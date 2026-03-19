import React from "react";
import styles from "./Button.module.css";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "gradient";
export type ButtonType = "button" | "submit" | "reset";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  onClick,
  className = "",
  disabled,
  type = "button",
  ...rest
}) => {
  const buttonClasses = [
    styles.btn,
    styles[`btn-${size}`],
    styles[`btn-${variant}`],
    fullWidth ? styles["btn-full-width"] : "",
    loading ? styles["btn-loading"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className={styles["btn-spinner"]} />}
      {icon && iconPosition === "left" && !loading && (
        <span className={styles["btn-icon-left"]}>{icon}</span>
      )}
      <span className={styles["btn-content"]}>{children}</span>
      {icon && iconPosition === "right" && !loading && (
        <span className={styles["btn-icon-right"]}>{icon}</span>
      )}
    </button>
  );
};

export default Button;
