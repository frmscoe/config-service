import { UpOutlined, DownOutlined } from "@ant-design/icons";

interface Props {
    open: boolean;
    setOpen: (val: boolean) => void;
    upClassName?: string;
    downClassName?: string;
}
export const AccordionArrows: React.FunctionComponent<Props> = ({ open, setOpen }) => {
    return open ? <UpOutlined style={{ fontSize: '1rem', cursor: 'pointer' }} data-testid="hide-recently-removed" onClick={() => setOpen(false)} /> : <DownOutlined data-testid="show-recently-removed" onClick={() => setOpen(true)} style={{ fontSize: '1rem', cursor: 'pointer' }} />


}