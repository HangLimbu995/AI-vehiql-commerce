"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/helper";
  import Image from "next/image";

function clamp(value, min, max) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

  const EMICalculator = ({ price: initialPrice = 30000, image, title }) => {
  const [price, setPrice] = useState(Number(initialPrice) || 30000);
  const [downPayment, setDownPayment] = useState(
    Math.min(Math.round((Number(initialPrice) || 30000) * 0.1), Number(initialPrice) || 30000)
  );
  const [apr, setApr] = useState(4.5);
  const [months, setMonths] = useState(60);

  const priceMax = useMemo(
    () => Math.max(20000, Math.ceil(((Number(initialPrice) || 30000) * 1.8) / 1000) * 1000),
    [initialPrice]
  );
  const priceMin = 1000;
  const dpMax = Math.max(price, 0);

  const monthlyPayment = useMemo(() => {
    const financed = Math.max(price - downPayment, 0);
    const monthlyRate = (apr / 100) / 12;
    if (months <= 0) return 0;
    if (monthlyRate === 0) return financed / months;
    const growth = Math.pow(1 + monthlyRate, months);
    return (financed * monthlyRate * growth) / (growth - 1);
  }, [price, downPayment, apr, months]);

  const financedAmount = Math.max(price - downPayment, 0);
  const totalPayable = monthlyPayment * months;
  const totalInterest = Math.max(totalPayable - financedAmount, 0);

  // Removed preset term buttons per request

  return (
    <Card className="sm:max-w-xl w-full overflow-hidden pt-0">
      <CardHeader className="p-0 px-0">
        <div className="relative h-36 sm:h-44 w-full overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title || "Selected car"}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-12 sm:h-14 bg-gradient-to-b from-black/65 via-black/35 to-transparent pointer-events-none" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-0">
            <div className="text-white text-xs tracking-wide mt-2">EMI CALCULATOR</div>
          </div>

          <div className="absolute bottom-2 left-4 text-white drop-shadow-sm">
            <div className="text-[11px] uppercase opacity-80">Your Car</div>
            {title ? (
              <div className="text-xs font-semibold truncate max-w-[70%]">{title}</div>
            ) : null}
            <div className="text-2xl font-semibold leading-none">{formatCurrency(price)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 px-6">
        {/* DOWN PAYMENT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-muted-foreground">DOWN PAYMENT</Label>
            <span className="font-medium">{formatCurrency(downPayment)}</span>
          </div>
          <Slider
            min={0}
            max={dpMax}
            step={500}
            value={[downPayment]}
            onValueChange={(v) => setDownPayment(clamp(v[0], 0, dpMax))}
          />
        </div>

        {/* LOAN AMOUNT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-muted-foreground">LOAN AMOUNT</Label>
            <span className="font-medium">{formatCurrency(financedAmount)}</span>
          </div>
          <Slider
            min={Math.min(1000, price)}
            max={price}
            step={500}
            value={[financedAmount]}
            onValueChange={(v) => {
              const next = clamp(v[0], 0, price);
              setDownPayment(clamp(price - next, 0, price));
            }}
          />
        </div>

        {/* INTEREST RATE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-muted-foreground">INTEREST RATE</Label>
            <div className="flex items-center gap-2">
              <Input
                id="apr"
                type="number"
                min={0}
                max={25}
                step={0.1}
                value={apr}
                onChange={(e) => setApr(clamp(parseFloat(e.target.value), 0, 25))}
                className="w-20 h-7 text-right"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <Slider min={0} max={25} step={0.1} value={[apr]} onValueChange={(v) => setApr(clamp(v[0], 0, 25))} />
        </div>

        {/* LOAN TENURE (MONTHS) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Label className="text-muted-foreground">LOAN TENURE (MONTHS)</Label>
            <Input
              id="months"
              type="number"
              min={6}
              max={96}
              step={1}
              value={months}
              onChange={(e) => setMonths(clamp(parseInt(e.target.value, 10), 6, 96))}
              className="w-20 h-7 text-right"
            />
          </div>
          <Slider min={6} max={96} step={1} value={[months]} onValueChange={(v) => setMonths(clamp(v[0], 6, 96))} />
        </div>

        {/* Bottom Summary Bar */}
        <div className="rounded-lg overflow-hidden border">
          <div className="flex items-stretch bg-gradient-to-r from-sky-600 to-blue-700 text-white">
            <div className="flex-1 grid place-items-center py-3">
              <div className="text-[11px] uppercase opacity-90">EMI</div>
              <div className="text-sm font-semibold">{formatCurrency(monthlyPayment)}</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex-1 grid place-items-center py-3">
              <div className="text-[11px] uppercase opacity-90">Total Payment</div>
              <div className="text-sm font-semibold">{formatCurrency(totalPayable)}</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="p-2">
              <Button className="h-full bg-white text-blue-700 hover:bg-white/90">APPLY</Button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground text-center">
          Estimates are illustrative and do not constitute a financing offer.
        </div>
      </CardContent>
    </Card>
  );
};

export default EMICalculator;
