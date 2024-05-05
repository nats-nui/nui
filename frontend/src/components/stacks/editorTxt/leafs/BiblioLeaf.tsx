import { TextType } from "@/stores/stacks/editor/utils/types";
import { FunctionComponent } from "react";
import { RenderLeafProps } from "slate-react";
import cls from "./Leaf.module.css";



const BiblioLeaf: FunctionComponent<RenderLeafProps> = ({
	attributes,
	leaf,
	children,
}) => {
	const leafBib = leaf as TextType
	const cnRoot = `${cls.root} ${leafBib.bold ? cls.bold : ""} ${leafBib.link ? cls.link : ""}`
	return <span
		{...attributes}
		className={cnRoot}
	>
		{children}
	</span>
}


export default BiblioLeaf