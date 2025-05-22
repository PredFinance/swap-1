"use client"

interface AdminTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function AdminTabs({ activeTab, setActiveTab }: AdminTabsProps) {
  const tabs = [
    { id: "fees", label: "Fee Management" },
    { id: "liquidity", label: "Liquidity Management" },
    { id: "withdraw", label: "Fee Withdrawal" },
  ]

  return (
    <div className="border-b border-gray-700 mb-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`py-3 px-1 font-medium text-sm relative ${
              activeTab === tab.id
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
