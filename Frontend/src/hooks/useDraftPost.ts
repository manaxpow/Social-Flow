import { useState, useEffect, useCallback } from "react";

export interface DraftMediaItem {
  url: string;
  publicId: string;
}

interface DraftPost {
  content: string;
  mediaItems: DraftMediaItem[];
  timestamp: number;
}

const DRAFT_STORAGE_KEY = "socialflow_draft_post";
const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const useDraftPost = () => {
  const [draft, setDraft] = useState<DraftPost>({
    content: "",
    mediaItems: [],
    timestamp: Date.now(),
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsedDraft = JSON.parse(stored);

        // Check if draft is expired
        if (Date.now() - parsedDraft.timestamp < DRAFT_EXPIRY_MS) {
          setDraft(parsedDraft);
        } else {
          // Remove expired draft
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load draft from localStorage:", error);
    }
  }, []);

  // Save draft to localStorage whenever it changes
  useEffect(() => {
    try {
      if (draft.content || draft.mediaItems.length > 0) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } else {
        // Clear storage if draft is empty
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save draft to localStorage:", error);
    }
  }, [draft]);

  const updateContent = useCallback((content: string) => {
    setDraft((prev) => ({
      ...prev,
      content,
      timestamp: Date.now(),
    }));
  }, []);

  const setMediaItems = useCallback((mediaItems: DraftMediaItem[]) => {
    setDraft((prev) => ({
      ...prev,
      mediaItems,
      timestamp: Date.now(),
    }));
  }, []);

  const addMediaItem = useCallback((item: DraftMediaItem) => {
    setDraft((prev) => ({
      ...prev,
      mediaItems: [...prev.mediaItems, item],
      timestamp: Date.now(),
    }));
  }, []);

  const removeMediaItem = useCallback((index: number) => {
    setDraft((prev) => ({
      ...prev,
      mediaItems: prev.mediaItems.filter((_, i) => i !== index),
      timestamp: Date.now(),
    }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraft({
        content: "",
        mediaItems: [],
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to clear draft from localStorage:", error);
    }
  }, []);

  const hasDraft = Boolean(draft.content || draft.mediaItems.length > 0);

  return {
    draft,
    updateContent,
    setMediaItems,
    addMediaItem,
    removeMediaItem,
    clearDraft,
    hasDraft,
  };
};