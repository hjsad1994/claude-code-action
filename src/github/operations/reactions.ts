import type { Octokit } from "@octokit/rest";
import type { ParsedGitHubContext } from "../context";

/**
 * Add a reaction emoji to a comment
 * @param octokit - Octokit REST client
 * @param context - GitHub context
 * @param reaction - Reaction type: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes"
 */
export async function addReactionToComment(
  octokit: Octokit,
  context: ParsedGitHubContext,
  reaction: "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray" | "rocket" | "eyes" = "eyes",
): Promise<void> {
  const { owner, repo } = context.repository;

  // Get comment ID based on event type
  let commentId: number | undefined;

  if (context.eventName === "issue_comment") {
    const payload = context.payload as { comment: { id: number } };
    commentId = payload.comment.id;
  } else if (context.eventName === "pull_request_review_comment") {
    const payload = context.payload as { comment: { id: number } };
    commentId = payload.comment.id;
  } else if (context.eventName === "pull_request_review") {
    // For PR reviews, we need to get the review ID, not comment ID
    const payload = context.payload as { review: { id: number } };
    try {
      await octokit.reactions.createForPullRequestReviewComment({
        owner,
        repo,
        comment_id: payload.review.id,
        content: reaction,
      });
      console.log(`✅ Added ${reaction} reaction to PR review`);
      return;
    } catch (error) {
      console.warn(`Failed to add reaction to PR review:`, error);
      return;
    }
  }

  if (!commentId) {
    console.log("No comment ID found for reaction, skipping...");
    return;
  }

  try {
    await octokit.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: commentId,
      content: reaction,
    });
    console.log(`✅ Added ${reaction} reaction to comment ${commentId}`);
  } catch (error) {
    // Don't fail the action if reaction fails
    console.warn(`Failed to add reaction to comment ${commentId}:`, error);
  }
}
