import { useState, useCallback } from "react";
import type { Role, DecisionNode, DecisionTree } from "../data/grappleData";
import {
  grapplerTree,
  grappledTree,
  outsideTree,
  conditionReference,
  specialAbilities,
} from "../data/grappleData";

interface HistoryEntry {
  nodeId: string;
  choiceLabel?: string;
}

const roleInfo: Record<Role, { title: string; emoji: string; description: string }> = {
  grappler: {
    title: "Grappler",
    emoji: "💪",
    description: "You're grabbing someone or already have them grappled",
  },
  grappled: {
    title: "Grappled Creature",
    emoji: "🫴",
    description: "Someone has grabbed you and you want out",
  },
  outside: {
    title: "Outside the Grapple",
    emoji: "👀",
    description: "You're watching the grapple and want to help or interfere",
  },
};

function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Who Are You?</h2>
        <p className="text-base-content/70">Select your role in the grapple</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(roleInfo) as Role[]).map((role) => {
          const info = roleInfo[role];
          return (
            <button
              key={role}
              onClick={() => onSelect(role)}
              className="card bg-base-200 hover:bg-primary hover:text-primary-content transition-colors cursor-pointer"
            >
              <div className="card-body items-center text-center">
                <span className="text-4xl mb-2">{info.emoji}</span>
                <h3 className="card-title">{info.title}</h3>
                <p className="text-sm opacity-80">{info.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NodeDisplay({
  node,
  onChoice,
  onBack,
  canGoBack,
}: {
  node: DecisionNode;
  onChoice: (choiceId: string, label: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  const isResult = node.type === "result";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{node.title}</h2>
        <p className="text-base-content/80 text-lg">{node.content}</p>
      </div>

      {/* Mechanics box */}
      {node.mechanics && (
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <pre className="whitespace-pre-wrap font-mono text-sm">{node.mechanics}</pre>
        </div>
      )}

      {/* Tips */}
      {node.tips && node.tips.length > 0 && (
        <div className="bg-base-200 rounded-box p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span>💡</span> Tips
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {node.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Choices */}
      {node.choices && node.choices.length > 0 && (
        <div className="space-y-3">
          {node.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.id, choice.label)}
              className="btn btn-outline btn-primary w-full justify-start text-left h-auto py-3"
            >
              <div>
                <div className="font-semibold">{choice.label}</div>
                {choice.description && (
                  <div className="text-sm opacity-70 font-normal">
                    {choice.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Result actions */}
      {isResult && (
        <div className="divider">What now?</div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 justify-center">
        {canGoBack && (
          <button onClick={onBack} className="btn btn-ghost">
            ← Go Back
          </button>
        )}
        {isResult && (
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}

function QuickReference() {
  return (
    <div className="space-y-2 mt-6">
      {/* Conditions */}
      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div className="collapse-title font-medium">
          📖 Conditions Reference
        </div>
        <div className="collapse-content">
          <div className="space-y-4 pt-2">
            {Object.values(conditionReference).map((condition) => (
              <div key={condition.name}>
                <h4 className="font-bold text-primary">{condition.name}</h4>
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  {condition.effects.map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Abilities */}
      <div className="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div className="collapse-title font-medium">
          ⚡ Special Abilities (Grab, Constrict, Feats)
        </div>
        <div className="collapse-content">
          <div className="space-y-4 pt-2">
            {Object.values(specialAbilities).map((ability) => (
              <div key={ability.name}>
                <h4 className="font-bold text-secondary">{ability.name}</h4>
                <p className="text-xs opacity-70 mb-1">{ability.description}</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  {ability.effects.map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBreadcrumbs({
  history,
  tree,
}: {
  history: HistoryEntry[];
  tree: DecisionTree;
}) {
  if (history.length <= 1) return null;

  return (
    <div className="text-sm breadcrumbs overflow-x-auto">
      <ul>
        {history.map((entry, i) => {
          const node = tree.nodes[entry.nodeId];
          const isLast = i === history.length - 1;
          return (
            <li key={i} className={isLast ? "text-primary font-medium" : "opacity-60"}>
              {entry.choiceLabel || node?.title || "Start"}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function GrappleWizard() {
  const [role, setRole] = useState<Role | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const getTree = useCallback((): DecisionTree | null => {
    if (!role) return null;
    switch (role) {
      case "grappler":
        return grapplerTree;
      case "grappled":
        return grappledTree;
      case "outside":
        return outsideTree;
    }
  }, [role]);

  const tree = getTree();
  const currentNodeId = history.length > 0 ? history[history.length - 1].nodeId : null;
  const currentNode = tree && currentNodeId ? tree.nodes[currentNodeId] : null;

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    const tree =
      selectedRole === "grappler"
        ? grapplerTree
        : selectedRole === "grappled"
          ? grappledTree
          : outsideTree;
    setHistory([{ nodeId: tree.startNodeId }]);
  };

  const handleChoice = (choiceId: string, label: string) => {
    if (!currentNode || !currentNode.choices) return;
    const choice = currentNode.choices.find((c) => c.id === choiceId);
    if (!choice || !choice.nextNodeId) return;

    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory[newHistory.length - 1].choiceLabel = label;
      return [...newHistory, { nodeId: choice.nextNodeId! }];
    });
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory((prev) => prev.slice(0, -1));
    } else {
      setRole(null);
      setHistory([]);
    }
  };

  const handleReset = () => {
    setRole(null);
    setHistory([]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with role indicator */}
      {role && (
        <div className="flex items-center justify-between mb-4">
          <div className="badge badge-lg badge-primary gap-2">
            <span>{roleInfo[role].emoji}</span>
            {roleInfo[role].title}
          </div>
          <button onClick={handleReset} className="btn btn-ghost btn-sm">
            Change Role
          </button>
        </div>
      )}

      {/* Progress */}
      {tree && <ProgressBreadcrumbs history={history} tree={tree} />}

      {/* Main card */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {!role ? (
            <RoleSelector onSelect={handleRoleSelect} />
          ) : currentNode ? (
            <NodeDisplay
              node={currentNode}
              onChoice={handleChoice}
              onBack={handleBack}
              canGoBack={history.length > 0}
            />
          ) : (
            <div className="text-center text-error">
              Error: Node not found
            </div>
          )}
        </div>
      </div>

      {/* Reference section */}
      <QuickReference />

      {/* Attribution */}
      <p className="text-center text-xs opacity-50 mt-6">
        Based on the{" "}
        <a
          href="https://pfsprep.com/e107_files/public/1482694608_186_FT297_grappleflowchart_1.0.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          PFSPrep Grapple Flowchart v1.0
        </a>
        {" "}• Pathfinder 1st Edition Rules
      </p>
    </div>
  );
}
