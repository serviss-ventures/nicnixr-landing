import { supabase } from '../lib/supabase';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  milestone_type?: string;
  milestone_value?: number;
  loves: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

class CommunityService {
  /**
   * Create a new community post
   */
  async createPost(content: string, milestoneType?: string, milestoneValue?: number): Promise<CommunityPost> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content,
          milestone_type: milestoneType,
          milestone_value: milestoneValue,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating community post:', error);
      throw error;
    }
  }

  /**
   * Get community posts (uses the community_feed view for enriched data)
   */
  async getPosts(limit: number = 20, offset: number = 0) {
    try {
      // Try to use the community_feed view first
      const { data: feedData, error: feedError } = await supabase
        .from('community_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!feedError) {
        return feedData || [];
      }

      // If community_feed view doesn't exist, fall back to direct query
      console.log('community_feed view not found, using direct query');
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          users:user_id (
            username,
            display_name,
            avatar_url,
            days_clean
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      // Transform data to match community_feed structure
      return (data || []).map(post => ({
        id: post.id,
        content: post.content,
        milestone_type: post.milestone_type,
        milestone_value: post.milestone_value,
        loves: post.loves,
        created_at: post.created_at,
        updated_at: post.updated_at,
        username: post.users?.username,
        display_name: post.users?.display_name,
        avatar_url: post.users?.avatar_url,
        days_clean: post.users?.days_clean,
        comment_count: 0, // Would need a separate query
        user_loved: false, // Would need a separate query
        user_id: post.user_id
      }));
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  }

  /**
   * Love/unlike a post
   */
  async toggleLove(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already loved
      const { data: existingLove } = await supabase
        .from('community_loves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLove) {
        // Remove love
        const { error } = await supabase
          .from('community_loves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Decrement loves count
        await supabase.rpc('decrement_loves', { post_id: postId });
        return false; // Unloved
      } else {
        // Add love
        const { error } = await supabase
          .from('community_loves')
          .insert({
            post_id: postId,
            user_id: user.id,
          });

        if (error) throw error;

        // Increment loves count
        await supabase.rpc('increment_loves', { post_id: postId });
        return true; // Loved
      }
    } catch (error) {
      console.error('Error toggling love:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, content: string): Promise<CommunityComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          users:user_id (
            username,
            display_name,
            avatar_url,
            days_clean
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export default new CommunityService(); 