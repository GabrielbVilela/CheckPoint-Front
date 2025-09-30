import { Ionicons } from "@expo/vector-icons";
import React from "react";

type IconSymbolProps = {
  size: number;
  name: string;
  color: string;
};

export function IconSymbol({ size, name, color }: IconSymbolProps) {
  // Renderiza o ícone real usando Ionicons
  return <Ionicons name={name as any} size={size} color={color} />;
}

export default IconSymbol;