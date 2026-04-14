import type { IconBaseProps } from 'react-icons';
import { appIconRegistry, type AppIconKey, resolveAppIconKey } from '@/lib/icon-registry';

interface AppIconProps extends Omit<IconBaseProps, 'name'> {
  name?: string | null;
  fallback?: AppIconKey;
  label?: string;
}

export default function AppIcon({ name, fallback = 'terminal', label, ...props }: AppIconProps) {
  const key = resolveAppIconKey(name, fallback);
  const Icon = appIconRegistry[key];

  return <Icon aria-hidden={label ? undefined : true} aria-label={label} {...props} />;
}
