import { useState, useEffect, useCallback } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface VoteProps {
  postId: string;
  initialVoteCount: number;
  horizontal?: boolean;
}

export function Vote({
  postId,
  initialVoteCount,
  horizontal = false,
}: VoteProps) {
  const { user } = useAuth();
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [userVote, setUserVote] = useState<boolean | null>(null);

  useEffect(() => {
    setVoteCount(initialVoteCount);
  }, [initialVoteCount]);

  const fetchUserVote = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("users_votes")
        .select("is_upvote")
        .eq("post_id", postId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserVote((data as any).is_upvote);
      } else {
        setUserVote(null);
      }
    } catch (err) {
      console.error("Error fetching user vote:", err);
    }
  }, [user, postId]);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    } else {
      setUserVote(null);
    }
  }, [user, postId, fetchUserVote]);

  const handleVote = async (isUpvote: boolean) => {
    if (!user) {
      alert("You must be logged in to vote");
      return;
    }

    const originalVote = userVote;
    const originalCount = voteCount;

    let nextVote: boolean | null;
    let nextCount = voteCount;

    if (userVote === isUpvote) {
      // Cancel vote
      nextVote = null;
      nextCount = isUpvote ? voteCount - 1 : voteCount + 1;
    } else {
      // Switch or new vote
      nextVote = isUpvote;
      if (userVote === null) {
        nextCount = isUpvote ? voteCount + 1 : voteCount - 1;
      } else {
        // Switched from up to down or vice versa
        nextCount = isUpvote ? voteCount + 2 : voteCount - 2;
      }
    }

    // Optimistic Update
    setUserVote(nextVote);
    setVoteCount(nextCount);

    try {
      if (nextVote === null) {
        console.log("Deleting vote for post:", postId);
        const { error } = await supabase
          .from("users_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        console.log("Upserting vote:", {
          post_id: postId,
          user_id: user.id,
          is_upvote: nextVote,
        });
        const { error } = await (supabase.from("users_votes") as any).upsert(
          {
            post_id: postId,
            user_id: user.id,
            is_upvote: nextVote,
          },
          {
            onConflict: "user_id,post_id", // <--- DAS ist der entscheidende Teil!
          },
        );
        if (error) throw error;
      }
    } catch (err) {
      console.error("Error voting:", err);
      // Rollback
      setUserVote(originalVote);
      setVoteCount(originalCount);
    }
  };

  return (
    <div
      className={`flex ${horizontal ? "flex-row items-center gap-2" : "flex-col items-center gap-0.5"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => handleVote(true)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          userVote === true ? "text-orange-600" : "text-gray-500"
        }`}
        aria-label="Upvote"
      >
        <ArrowBigUp
          className={`w-6 h-6 ${userVote === true ? "fill-current" : ""}`}
        />
      </button>

      <span
        className={`text-xs font-bold min-w-[1rem] text-center ${
          userVote === true
            ? "text-orange-600"
            : userVote === false
              ? "text-blue-600"
              : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {voteCount}
      </span>

      <button
        onClick={() => handleVote(false)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          userVote === false ? "text-blue-600" : "text-gray-500"
        }`}
        aria-label="Downvote"
      >
        <ArrowBigDown
          className={`w-6 h-6 ${userVote === false ? "fill-current" : ""}`}
        />
      </button>
    </div>
  );
}
