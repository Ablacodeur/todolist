//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require ("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-vicky:Test123@cluster0.j4gpauj.mongodb.net/todolistDB');



const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to your todolist",
});
const item2 = new Item({
  name: "Click the button + to hit enter",
});
const item3 = new Item({
  name: "<-- to delete",
});
const defaultItems = [ item1,item2,item3];

// new schema of list
const listSchema = new mongoose.Schema({
  name: String,
  items:[itemSchema]
});

const List = mongoose.model("List", listSchema);
// new schema of list end


app.get("/", function(req, res) {

  Item.find({}, function(err, items){
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        }else{
          console.log("insertions done!")
        }
      })
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  })

});
// custom route paramater
app.get("/:customListName" ,function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName} ,function(err ,foundList){
    if(!err){
      if(!foundList){
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName)
      
      }else{
        // show an existing list
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    } 
  })

  
})
// custom route paramater end


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
   })
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName )
    })

  }

});

app.post("/delete", function(req,res){
  const checkItemId= req.body.checkbox ;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkItemId, function(err){
      if(!err){
        console.log("Deleted successfully");
      }
    })
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }


})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
