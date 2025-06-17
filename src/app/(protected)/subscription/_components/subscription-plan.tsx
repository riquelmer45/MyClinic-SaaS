"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface SubscriptionPlanProps {
  active?: boolean;
}

export default function SubscriptionPlan({
  active = false,
}: SubscriptionPlanProps) {
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
        throw new Error("Chave pública do Stripe não encontrada");
      }
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
      );
      if (!stripe) {
        throw new Error("Falha ao carregar o Stripe");
      }
      if (!data?.sessionId) {
        throw new Error("ID da sessão não encontrado");
      }
      await stripe.redirectToCheckout({
        sessionId: data?.sessionId,
      });
    },
  });
  const features = [
    "Cadastro de até 3 médicos",
    "Agendamentos ilimitados",
    "Métricas básicas",
    "Cadastro de pacientes",
    "Confirmação manual",
    "Suporte via e-mail",
  ];

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute();
  };

  return (
    <Card className="w-full max-w-sm border border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Essential</h3>
          {active && (
            <Badge className="text-primary bg-emerald-100 font-medium hover:bg-emerald-100">
              Atual
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Para profissionais autônomos ou pequenas clínicas
        </p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">R$59,90</span>
          <span className="ml-1 text-gray-600">/ mês</span>
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500">
                <CheckCircle2 className="h-3 w-3 stroke-[3] text-white" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full border border-gray-300 bg-white font-medium text-gray-900 hover:bg-gray-50"
          variant="outline"
          onClick={active ? () => {} : handleSubscribeClick}
          disabled={createStripeCheckoutAction.isExecuting}
        >
          {createStripeCheckoutAction.isExecuting ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : active ? (
            "Gerenciar assinatura"
          ) : (
            "Fazer Assinatura"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
