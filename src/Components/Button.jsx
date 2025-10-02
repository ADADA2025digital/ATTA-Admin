import React from "react";

const ButtonGlobal = ({ type, text, onClick, className, style, id }) => {
  return (
    <button
      type={type}
      id={id}              
      className={className}
      onClick={onClick}
      style={style}
    >
      {text}
    </button>
  );
};

export default ButtonGlobal;
