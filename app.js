const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb+srv://Ash:Ash123@cluster0.hwqwvet.mongodb.net/todolistDB");
}
const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("item", itemsSchema);
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
const List = new mongoose.model("list", listSchema);
const defaultItem1 = new Item({
  name: "welcome to our your todolist",
});
const defaultItem2 = new Item({
  name: "Hit + button to add a new item.",
});
const defaultItem3 = new Item({
  name: "<----Hit this checkbox to remove an item.",
});
const defaultArrayOfItems = [defaultItem1, defaultItem2, defaultItem3];

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultArrayOfItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted items successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("index", {
        listTitle: "Today",
        newListItems: foundItems,
      });
    }
  });
});
app.get("/favicon.ico", (req, res) => res.status(204));

app.get("/:listTitle", (req, res) => {
  const listTitle = _.capitalize(req.params.listTitle);

  List.findOne({ name: listTitle }, (err, list) => {
    if (list) {
      res.render("index", { listTitle: listTitle, newListItems: list.items });
    } else {
      const list = new List({
        name: listTitle,
        items: defaultArrayOfItems,
      });
      list.save();
      res.redirect("/" + list.name);
    }
  });

  // res.render("index", { listTitle: listTitle, newListItems: list.items });
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.post("/", (req, res) => {
  const newItemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  const newItem = new Item({
    name: newItemName,
  });
  if (listName == "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);
  if (listName == "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {});
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundlist) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("server is running on port 3000");
});
