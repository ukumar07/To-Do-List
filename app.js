const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

mongoose
  .connect("mongodb+srv://utkarshAdmin:test123@blogappdb.ptxcz08.mongodb.net/todoDB")
  .then(() => {
    console.log("Mongo Connection successful.");
  })
  .catch((err) => {
    console.log("Mongo Connection failed.", err);
  });

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require('lodash')

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const listsSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listsSchema);

const item1 = new Item({
  name: "Ben Dover",
});
const item2 = new Item({
  name: "John Oliver",
});
const item3 = new Item({
  name: "Shinzo Abe",
});

const newitems = [item1, item2, item3];

app.get("/", function (req, res) {
  const day = "Today";

  Item.find()
    .then((elements) => 
    {
      if (elements.length === 0) {
        Item.insertMany(newitems).then(res.redirect("/"));
      } else {
        res.render("list", { listTitle: day, newListItems: elements });
      }
    })

    .catch((err) => {
      console.log(err);
    });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") 
  {
    item.save().then(res.redirect("/"))
    
  } 
  else 
  {    
    List.findOne({ name: listName }).
    then((foundlist) => {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {

  const checkedId = req.body.checkbox;
  const listName = req.body.listname;

  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedId)
    .then(() => {
      console.log("Item removed successfully.");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedId}}}).
    then((foundlist)=>{
      res.redirect('/'+listName);
    })
  }
  
});

app.get("/:d", (req, res) => {

  const newListName = _.capitalize(req.params.d);

  List.findOne({ name: newListName }).then((foundlist) => 
  {
    if (!foundlist) 
    {
      const list = new List({
        name: newListName,
        items: newitems,
      });
      list.save();
      res.redirect("/" + newListName);
    }
    else 
    {
      res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3500, function () {
  console.log("Server started on port 3500");
});
