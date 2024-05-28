import {
  ArrowDown2Icon,
  ArrowDown3Icon,
  ArrowDownIcon,
  ArrowLeft2Icon,
  ArrowLeftIcon,
  ArrowRight2Icon,
  ArrowRightIcon,
  ArrowUp2Icon,
  CheckedIcon,
  Delete2Icon,
  DeleteIcon,
  DragIcon,
  FilledBulletIcon,
  FranceIcon,
  GermanyIcon,
  GridIcon,
  ImageIcon,
  LogoutIcon,
  MenuIcon,
  NotificationIcon,
  PersonIcon,
  PlusIcon,
  RewindLeft,
  RewindRight,
  SettingIcon,
  SpainIcon,
  SpinnerIcon,
  ThreeDotsIcon,
  UnitedKingdomIcon,
} from "./source";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconsMap: any = {
  "arrow-down": ArrowDownIcon,
  delete: DeleteIcon,
  plus: PlusIcon,
  spinner: SpinnerIcon,
  "drag-icon": DragIcon,
  "arrow-right": ArrowRightIcon,
  "arrow-left": ArrowLeftIcon,
  grid: GridIcon,
  image: ImageIcon,
  person: PersonIcon,
  setting: SettingIcon,
  logout: LogoutIcon,
  "united-kingdom": UnitedKingdomIcon,
  germany: GermanyIcon,
  france: FranceIcon,
  "rewind-left": RewindLeft,
  "rewind-right": RewindRight,
  notification: NotificationIcon,
  menu: MenuIcon,
  "arrow-right-2": ArrowRight2Icon,
  "arrow-left-2": ArrowLeft2Icon,
  "arrow-up-2": ArrowUp2Icon,
  "arrow-down-2": ArrowDown2Icon,
  "arrow-down-3": ArrowDown3Icon,
  delete2: Delete2Icon,
  "three-dots": ThreeDotsIcon,
  checked: CheckedIcon,
  "filled-bullet": FilledBulletIcon,
  spain: SpainIcon
};

interface IconProps {
  name: string;
  className?: string;
  color?: string;
  size?: "tiny" | "small" | "medium" | "large" | "xLarge" | "huge";
  width?: string;
  height?: string;
  onClick?: (e: MouseEvent) => void;
}

const Icon = ({ name, className = "", color, size, width, height, ...props }: IconProps) => {
  const sizes = {
    tiny: "0.5rem",
    small: "1rem",
    medium: "1.75rem",
    large: "2rem",
    xLarge: "3rem",
    huge: "5rem",
  };

  const Component = IconsMap[name];

  if (!Component) {
    return <div />;
  }

  const iconWidth = size ? sizes[size] : width;
  const iconHeight = size ? sizes[size] : height;

  return (
    <Component
      width={iconWidth}
      height={iconHeight}
      className={className}
      style={{ color }}
      {...props}
    />
  );
};

export { Icon };
