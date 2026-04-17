const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken?.startsWith("pk_test_")) return null;

  return (
    <div className="w-full bg-amber/15 border-b border-amber/30 px-4 py-2 text-center text-sm text-amber">
      Tutti i pagamenti effettuati in anteprima sono in modalità test.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium"
      >
        Maggiori info
      </a>
    </div>
  );
}
