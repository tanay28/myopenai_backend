const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { MongoClient } = require("mongodb");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
require("dotenv/config");

const client = new MongoClient(process.env.DB_URl);

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY
});

const EmployeeSchema = {
  employee_id: String,
  first_name: String,
  last_name: String,
  date_of_birth: String,
  address: {
    street: String,
    city: String,
    state: String,
    postal_code: String,
    country: String,
  },
  contact_details: {
    email: String,
    phone_number: String,
  },
  job_details: {
    job_title: String,
    department: String,
    hire_date: String,
    employment_type: String,
    salary: Number,
    currency: String,
  },
  work_location: {
    nearest_office: String,
    is_remote: Boolean,
  },
  reporting_manager: { type: String, nullable: true },
  skills: [String],
  performance_reviews: [
    {
      review_date: String,
      rating: Number,
      comments: String,
    },
  ],
  benefits: {
    health_insurance: String,
    retirement_plan: String,
    paid_time_off: Number,
  },
  emergency_contact: {
    name: String,
    relationship: String,
    phone_number: String,
  },
  notes: String,
};

const parser = StructuredOutputParser.fromZodSchema(EmployeeSchema);

async function generateSyntheticData() {
  const prompt = `You are a helpful assistant that generates employee data. Generate 10 fictional employee records. Each record should include the following fields: employee_id, first_name, last_name, date_of_birth, address, contact_details, job_details, work_location, reporting_manager, skills, performance_reviews, benefits, emergency_contact, notes. Ensure variety in the data and realistic values.

  ${parser.getFormatInstructions()}`;

  console.log("Generating synthetic data...");

  const response = await llm.invoke(prompt);
  return parser.parse(response.content);
}

async function createEmployeeSummary(employee) {
  return new Promise((resolve) => {
    const jobDetails = `${employee.job_details.job_title} in ${employee.job_details.department}`;
    const skills = employee.skills.join(", ");
    const performanceReviews = employee.performance_reviews
      .map(
        (review) =>
          `Rated ${review.rating} on ${review.review_date}: ${review.comments}`
      )
      .join(" ");
    const basicInfo = `${employee.first_name} ${employee.last_name}, born on ${employee.date_of_birth}`;
    const workLocation = `Works at ${employee.work_location.nearest_office}, Remote: ${employee.work_location.is_remote}`;
    const notes = employee.notes;

    const summary = `${basicInfo}. Job: ${jobDetails}. Skills: ${skills}. Reviews: ${performanceReviews}. Location: ${workLocation}. Notes: ${notes}`;

    resolve(summary);
  });
}

async function seedDatabase() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("hr_database");
    const collection = db.collection("employees");

    await collection.deleteMany({});
    
    const syntheticData = await generateSyntheticData();

    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await createEmployeeSummary(record),
        metadata: { ...record },
      }))
    );
    
    for (const record of recordsWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record],
        new OpenAIEmbeddings(),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        }
      );

      console.log("Successfully processed & saved record:", record.metadata.employee_id);
    }

    console.log("Database seeding completed");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);
