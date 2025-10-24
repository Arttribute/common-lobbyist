import CommonTokenFaucet from "@/components/common-token/CommonTokenFaucet";

export default function FaucetPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            $COMMON Token Faucet
          </h1>
          <p className="text-gray-600">
            Get $COMMON tokens to fund your agents and participate in governance
          </p>
        </div>

        <CommonTokenFaucet />

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
