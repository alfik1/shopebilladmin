import { IconTag } from './Icons';
import { COLORS } from '../../constants/colors';

const BG_BY_KEY = {
  shirtsBg: COLORS.activityShirtsBg,
  pantsBg: COLORS.activityPantsBg,
  innerwearBg: COLORS.activityInnerwearBg,
  defaultBg: COLORS.navSelectedBackground,
};

export const backgroundForKey = (key) => BG_BY_KEY[key] || COLORS.iconBackground;

export default function CategoryIcon({ background = COLORS.iconBackground, size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <IconTag size={20} color={COLORS.primary} />
    </div>
  );
}