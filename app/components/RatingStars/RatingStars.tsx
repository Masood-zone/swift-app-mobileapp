"use client";

import type React from "react";
import { View, Text, StyleSheet } from "react-native";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 16,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Full stars */}
      {Array.from({ length: fullStars }, (_, index) => (
        <Text key={`full-${index}`} style={[styles.star, { fontSize: size }]}>
          ★
        </Text>
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <Text style={[styles.star, styles.halfStar, { fontSize: size }]}>
          ★
        </Text>
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, index) => (
        <Text
          key={`empty-${index}`}
          style={[styles.star, styles.emptyStar, { fontSize: size }]}
        >
          ★
        </Text>
      ))}

      <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    color: "#FFD700",
    marginRight: 2,
  },
  halfStar: {
    color: "#FFD700",
    opacity: 0.5,
  },
  emptyStar: {
    color: "#DDD",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#666",
  },
});
