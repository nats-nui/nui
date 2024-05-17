import { TextType } from "@/stores/stacks/editor/utils/types";
import { FunctionComponent } from "react";
import { RenderLeafProps } from "slate-react";
import cls from "./BiblioLeaf.module.css";



interface Props extends RenderLeafProps {
}

const BiblioLeaf: FunctionComponent<Props> = ({
	attributes,
	leaf,
	children,
}) => {
	const leafBib = leaf as TextType
	const clsBold = leafBib.bold ? cls.bold : ""
	const clsItalic = leafBib.italic? cls.italic : ""
	const clsCode = leafBib.code ? cls.code : ""
	const clsLink = leafBib.link ? cls.link : ""
	const cnRoot = `${cls.root} ${clsBold} ${clsItalic} ${clsCode} ${clsLink}`

	return <span
		{...attributes}
		className={cnRoot}
	>
		{children}
	</span>
}

export default BiblioLeaf
