import ReactMarkdown from "react-markdown";

export default function Markdown({ children, ...props }: any) {
  return (
    <ReactMarkdown
      linkTarget={"_blank"}
      components={{
        a: ({ node, children, ...props }) => {
          const linkProps = props;
          if (props.target === "_blank") {
            linkProps["rel"] = "noopener noreferrer";
          }
          return <a {...linkProps}>{children}</a>;
        },
      }}
      {...props}
    >
      {children}
    </ReactMarkdown>
  );
}
