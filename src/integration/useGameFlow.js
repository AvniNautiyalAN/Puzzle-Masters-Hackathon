// src/integration/useGameFlow.js
import { useContext } from "react";
import { GameFlowContext } from "./GameFlowContextInstance";

export function useGameFlow() {
  return useContext(GameFlowContext);
}
