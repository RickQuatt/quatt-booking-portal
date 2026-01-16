import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations";
import {
  isValidUrl,
  getImageFallbackUrl,
  IMAGE_CONSTANTS,
} from "@/utils/urlUtils";

export interface ChecklistItemProps {
  question: string;
  answer: string | string[];
  onImageClick?: (url: string, index: number) => void;
  className?: string;
}

/**
 * ChecklistItem - Renders a single checklist question-answer pair
 * Detects URLs and displays them as clickable image thumbnails
 * Displays text values as badges
 *
 * @example
 * ```tsx
 * <ChecklistItem
 *   question="Condition of equipment"
 *   answer="Good"
 *   onImageClick={(url, index) => openLightbox(url, index)}
 * />
 * ```
 */
export function ChecklistItem({
  question,
  answer,
  onImageClick,
  className = "",
}: ChecklistItemProps) {
  // Normalize answer to always be an array
  const answers = Array.isArray(answer) ? answer : [answer];

  // Check if all answers are URLs (images)
  const allAnswersAreUrls = answers.every(
    (a) => typeof a === "string" && isValidUrl(a),
  );

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className={`grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border-b border-border last:border-b-0 ${className}`}
    >
      {/* Question */}
      <div className="font-medium text-sm text-gray-700 dark:text-gray-300">
        {question}
      </div>

      {/* Answer */}
      <div className="flex flex-wrap gap-2 items-start">
        {allAnswersAreUrls
          ? // Display images
            answers.map((url, index) => (
              <button
                key={index}
                onClick={() => onImageClick?.(url, index)}
                className="relative group overflow-hidden rounded-md border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={url}
                  alt={`${question} - Image ${index + 1}`}
                  className="w-auto object-cover group-hover:scale-105 transition-transform duration-200"
                  style={{ height: `${IMAGE_CONSTANTS.THUMBNAIL_HEIGHT}px` }}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback for failed image loads
                    (e.target as HTMLImageElement).src = getImageFallbackUrl(
                      IMAGE_CONSTANTS.FALLBACK_IMAGE_SIZE,
                      "Image not found",
                    );
                  }}
                />
              </button>
            ))
          : // Display text badges
            answers.map((value, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-sm font-normal"
              >
                {value || "(empty)"}
              </Badge>
            ))}
      </div>
    </motion.div>
  );
}
