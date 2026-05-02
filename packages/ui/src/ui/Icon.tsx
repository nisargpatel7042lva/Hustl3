'use client';

import * as LucideIcons from 'lucide-react';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string; size?: number }>> = {
  Palette:     LucideIcons.Palette,
  Code:        LucideIcons.Code,
  PenTool:     LucideIcons.PenTool,
  Bot:         LucideIcons.Bot,
  BarChart3:   LucideIcons.BarChart3,
  Briefcase:   LucideIcons.Briefcase,
  Search:      LucideIcons.Search,
  Shield:      LucideIcons.Shield,
  CheckCircle: LucideIcons.CheckCircle,
  Sparkles:    LucideIcons.Sparkles,
  Star:        LucideIcons.Star,
  ArrowRight:  LucideIcons.ArrowRight,
  Clock:       LucideIcons.Clock,
  User:        LucideIcons.User,
  Users:       LucideIcons.Users,
  Zap:         LucideIcons.Zap,
  TrendingUp:  LucideIcons.TrendingUp,
  Globe:       LucideIcons.Globe,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} size={size} />;
}