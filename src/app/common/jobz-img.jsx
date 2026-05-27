import { publicUrlFor } from "../../globals/constants";

function JobZImage(props) {
    const src = props.src;
    const processedSrc = src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/api/') || src.startsWith('/uploads/')) ? src : publicUrlFor(src);

    return(
        <>
            <img {...props} src={processedSrc} alt={props.alt}/>
        </>
    )
}

export default JobZImage;
