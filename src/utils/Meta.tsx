import { Helmet, HelmetProvider } from "react-helmet-async";

interface IMeta {
  title: string;
  description: string;
  keywords?: string;
}

class Meta {
  public static data = (data: IMeta) => {
    return (
      <HelmetProvider>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{data.title}</title>
          <meta name="description" content={data.description} />
          <meta name="keywords" content={data.keywords} />
        </Helmet>
      </HelmetProvider>
    );
  };
}

export default Meta.data;