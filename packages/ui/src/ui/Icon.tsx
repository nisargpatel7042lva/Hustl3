'use client';

import * as LucideIcons from 'lucide-react';
import { ComponentType } from 'react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Palette: LucideIcons.Palette,
  Code: LucideIcons.Code,
  PenTool: LucideIcons.PenTool,
  Bot: LucideIcons.Bot,
  BarChart3: LucideIcons.BarChart3,
  Briefcase: LucideIcons.Briefcase,
  Search: LucideIcons.Search,
  Shield: LucideIcons.Shield,
  CheckCircle: LucideIcons.CheckCircle,
  Sparkles: LucideIcons.Sparkles,
  Star: LucideIcons.Star,
  ArrowRight: LucideIcons.ArrowRight,
  Clock: LucideIcons.Clock,
  User: LucideIcons.User,
  Users: LucideIcons.Users,
};

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
}