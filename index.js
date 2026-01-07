import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const db = new pg.Client({
  user:"postgres",
  port:5432,
  database:"world",
  password:"atharva_7504",
  host:"localhost",
});
const app = express();
const port = 3000;
db.connect()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) =>{
    countries.push(country.country_code);
  })
  return countries;
}

app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisited();
  res.render("index.ejs",{ countries : countries , total : countries.length});
});
app.post("/add", async (req,res)=>{
  //Taking country name input from user
  let input = req.body["country"];
  //selecting country_code matching to country_name in countries table
  try{
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  '%' || $1 || '%';",[input.toLowerCase()]);
    const data = result.rows[0]; // we get  {id ,country_code ,country_name}
    const countryCode = data.country_code; // selecting country_code from object
    try{
      // inserting country_code in visited_countries table
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[countryCode]);
      res.redirect("/");
    }catch(err){
      console.log(err);
      const countries = await checkVisited();
      res.render("index.ejs",{countries:countries,total:countries.length,error:"Country has already been added,try again."});
    }
  }catch(err){
    console.log(err);
    const countries = await checkVisited();
    res.render("index.ejs",{countries:countries,total:countries.length,error:"Country name do not exist, try again."}); 
  }
})
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
