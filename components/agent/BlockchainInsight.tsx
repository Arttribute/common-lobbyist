"use client";

import { ExternalLink, TrendingUp, Users, Coins, Activity } from "lucide-react";

interface BlockchainInsightProps {
  type: "signals" | "top_content" | "user_activity" | "transfers" | "transaction";
  data: any;
}

export default function BlockchainInsight({ type, data }: BlockchainInsightProps) {
  if (!data) return null;

  switch (type) {
    case "signals":
      return <SignalsInsight data={data} />;
    case "top_content":
      return <TopContentInsight data={data} />;
    case "user_activity":
      return <UserActivityInsight data={data} />;
    case "transfers":
      return <TransfersInsight data={data} />;
    case "transaction":
      return <TransactionInsight data={data} />;
    default:
      return null;
  }
}

function SignalsInsight({ data }: { data: any }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-900">Signal Activity</h4>
      </div>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-gray-600">Total Signals:</span>{" "}
          <span className="font-bold text-blue-700">{data.totalSignals}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Signal Count:</span>{" "}
          <span className="font-bold">{data.signalCount}</span>
        </div>
        {data.recentSignals && data.recentSignals.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-600 mb-2">Recent Signalers:</p>
            <div className="space-y-1">
              {data.recentSignals.map((signal: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <a
                    href={signal.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-mono"
                  >
                    {signal.user.slice(0, 8)}...{signal.user.slice(-6)}
                  </a>
                  <span className="text-gray-700">Weight: {signal.weight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.explorerLink && (
          <a
            href={data.explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
          >
            <ExternalLink className="w-3 h-3" />
            View on Blockscout
          </a>
        )}
      </div>
    </div>
  );
}

function TopContentInsight({ data }: { data: any }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-purple-600" />
        <h4 className="font-semibold text-purple-900">Top Signaled Content</h4>
      </div>
      <div className="space-y-2">
        {data.topContent && data.topContent.slice(0, 5).map((content: any, i: number) => (
          <div key={content.id} className="bg-white rounded p-2 border border-purple-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                  {content.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-600">
                    {content.signalCount} signals
                  </span>
                  <span className="text-xs font-bold text-purple-600">
                    {content.totalSignals} weight
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 ml-2">
                #{i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UserActivityInsight({ data }: { data: any }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-green-600" />
        <h4 className="font-semibold text-green-900">User Activity</h4>
      </div>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-gray-600">Total Signals:</span>{" "}
          <span className="font-bold">{data.totalSignals}</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-600">Token Balance:</span>{" "}
          <span className="font-bold text-green-700">{data.tokenBalance}</span>
        </div>
        <a
          href={data.explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-2"
        >
          <ExternalLink className="w-3 h-3" />
          View on Blockscout
        </a>
      </div>
    </div>
  );
}

function TransfersInsight({ data }: { data: any }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <Coins className="w-5 h-5 text-amber-600" />
        <h4 className="font-semibold text-amber-900">Recent Token Transfers</h4>
      </div>
      <div className="space-y-2">
        {data.transfers && data.transfers.slice(0, 5).map((transfer: any, i: number) => (
          <div key={i} className="bg-white rounded p-2 border border-amber-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-gray-600">
                {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)}
              </span>
              <span className="text-gray-400">→</span>
              <span className="font-mono text-gray-600">
                {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
              </span>
              <span className="font-bold text-amber-700">{transfer.value}</span>
            </div>
            <a
              href={transfer.explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-600 hover:underline mt-1 inline-block"
            >
              View tx
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionInsight({ data }: { data: any }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-gray-600" />
        <h4 className="font-semibold text-gray-900">Transaction Details</h4>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Status:</span>{" "}
          <span className={`font-bold ${data.status === "ok" ? "text-green-600" : "text-red-600"}`}>
            {data.status}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Value:</span>{" "}
          <span className="font-bold">{data.value} ETH</span>
        </div>
        <div>
          <span className="text-gray-600">Block:</span>{" "}
          <span className="font-mono">{data.blockNumber}</span>
        </div>
        <a
          href={data.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
        >
          <ExternalLink className="w-3 h-3" />
          View full details
        </a>
      </div>
    </div>
  );
}
