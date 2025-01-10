import Layout from "../../../../components/Layout"

export default async function Page({ params }) {
  const entry = await getEntry()
  return (
    <Layout route='journal'>

    </Layout>
  )
} 
