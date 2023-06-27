import type { JSX, VoidComponent } from "solid-js";

export type ImagePlaceholderProps = JSX.ImgHTMLAttributes<HTMLImageElement>;

// TODO: better image placeholder
const ImagePlaceholder: VoidComponent<ImagePlaceholderProps> = (props) => (
  <img
    src="https://res.cloudinary.com/practicaldev/image/fetch/s--RxLccrut--/c_imagga_scale,f_auto,fl_progressive,h_500,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/i/hpmen6tf0q6tkr3288m5.png"
    alt="placeholder"
    {...props}
  />
);

export default ImagePlaceholder;
