import { Player } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useState } from "react";

interface BankSectionProps {
  player: Player;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

export function BankSection({ player, onDeposit, onWithdraw }: BankSectionProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      onDeposit(amount);
      setDepositAmount("");
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!isNaN(amount) && amount > 0) {
      onWithdraw(amount);
      setWithdrawAmount("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">🏦 Banco</h2>
      <p className="text-muted-foreground mb-6">
        Guarde seu dinheiro no banco para protegê-lo caso seja preso ou morto.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 border-border bg-card text-center">
          <div className="text-4xl mb-2">💵</div>
          <p className="text-sm text-muted-foreground mb-1">Dinheiro em Mãos</p>
          <p className="text-3xl font-bold text-accent">${player.money.toLocaleString()}</p>
          <p className="text-xs text-danger mt-2">⚠️ Pode ser perdido se preso</p>
        </Card>

        <Card className="p-6 border-border bg-card text-center">
          <div className="text-4xl mb-2">🏦</div>
          <p className="text-sm text-muted-foreground mb-1">No Banco</p>
          <p className="text-3xl font-bold text-success">${player.bankMoney.toLocaleString()}</p>
          <p className="text-xs text-success mt-2">✅ Protegido e seguro</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-card">
          <h3 className="text-xl font-bold text-foreground mb-4">💰 Depositar</h3>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Quantidade"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="bg-input border-border"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDepositAmount(String(Math.floor(player.money * 0.25)))}
              >
                25%
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDepositAmount(String(Math.floor(player.money * 0.5)))}
              >
                50%
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDepositAmount(String(Math.floor(player.money * 0.75)))}
              >
                75%
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDepositAmount(String(player.money))}
              >
                Tudo
              </Button>
            </div>
            <Button onClick={handleDeposit} variant="default" className="w-full">
              Depositar
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <h3 className="text-xl font-bold text-foreground mb-4">💸 Sacar</h3>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Quantidade"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-input border-border"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor(player.bankMoney * 0.25)))}
              >
                25%
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor(player.bankMoney * 0.5)))}
              >
                50%
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWithdrawAmount(String(Math.floor(player.bankMoney * 0.75)))}
              >
                75%
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setWithdrawAmount(String(player.bankMoney))}
              >
                Tudo
              </Button>
            </div>
            <Button onClick={handleWithdraw} variant="default" className="w-full">
              Sacar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
