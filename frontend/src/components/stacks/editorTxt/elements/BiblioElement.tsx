import Chapter from "./Chapter"
import Paragraph from "./Paragraph"
import Text from "./Text"
import { FunctionComponent } from "react"
import { RenderElementProps } from "slate-react"
import { BLOCK_TYPE, ElementType } from "@/stores/stacks/editor/utils/types"



const BiblioElement: FunctionComponent<RenderElementProps> = (
	props,
) => {
	const element = props.element as ElementType
	switch (element.type) {
		case BLOCK_TYPE.CHAPTER:
			return <Chapter {...props} />
		case BLOCK_TYPE.PARAGRAPH:
			return <Paragraph {...props} />
		// case BLOCK_TYPE.IMAGE:
		// 	return <Image {...props} />
		// case BLOCK_TYPE.CODE:
		// 	return <Code {...props} />
		case BLOCK_TYPE.TEXT:	
		default:
			return <Text {...props} />
	}
}

export default BiblioElement