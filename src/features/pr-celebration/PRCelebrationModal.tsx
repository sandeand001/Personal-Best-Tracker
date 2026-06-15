import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../../app/store";
import { TierBadge } from "../../components/TierBadge";
import { tierColorVar } from "../../components/tier-utils";

export function PRCelebrationModal() {
  const queue = useAppStore((s) => s.celebrationQueue);
  const dequeue = useAppStore((s) => s.dequeueCelebration);
  const settings = useAppStore((s) => s.settings);

  const current = queue[0];
  if (current && settings.hapticsEnabled && "vibrate" in navigator) {
    navigator.vibrate?.(50);
  }

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={dequeue}
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="rounded-2xl p-8 text-center max-w-md w-full"
            style={{ background: "var(--surface)", border: `2px solid ${current.tier ? tierColorVar(current.tier) : "var(--accent)"}` }}
          >
            {current.kind === "pr" && current.pr ? (
              <>
                <div className="text-5xl mb-3">🏋️</div>
                <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>NEW PR</h2>
                <p className="text-lg mb-3">{current.exerciseName}</p>
                <div className="text-2xl font-bold mb-2" style={{ color: current.tier ? tierColorVar(current.tier) : "var(--accent)" }}>
                  {current.pr.prSlots.join(" · ")}
                </div>
                {current.percentile != null && current.tier && (
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{current.percentile.toFixed(1)}th percentile</span>
                    <TierBadge tier={current.tier} />
                  </div>
                )}
              </>
            ) : current.kind === "achievement" && current.achievement ? (
              <>
                <div className="text-5xl mb-3">🏆</div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>ACHIEVEMENT</h2>
                <p className="text-xl font-bold mb-2" style={{ color: "var(--accent)" }}>{current.achievement.title}</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{current.achievement.description}</p>
                <p className="text-xs mt-3 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {current.achievement.rarity}
                </p>
              </>
            ) : null}
            <button
              onClick={dequeue}
              className="mt-6 w-full py-2 rounded-lg font-medium"
              style={{ background: "var(--surface-2)", color: "var(--text)" }}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
