var toDoArr = [];

function test() {
	let num = document.querySelector("#test").value.trim();
	for (let i = 0; i < num; i++) {
		let testobj = {
			todo: "todo" + i,
			done: false,
		};
		toDoArr.push(testobj);
	}
	saveData(toDoArr);
	updateList();
	document.querySelector("#test").value = "";
}

// 添加todo
function addToDo() {
	var objToDo = {
		todo: "",
		done: false,
	};
	let toDoText = document.querySelector("#toDoText").value.trim();
	if (!toDoText) {
		alert("todo不能为空");
		document.querySelector("#toDoText").value = "";
		return;
	}
	objToDo.todo = toDoText;
	toDoArr.push(objToDo);
	saveData(toDoArr);
	updateList();
	document.querySelector("#toDoText").value = "";
}

// 更新List
function updateList() {
	let toDoList = document.querySelector("#toDoList"),
		doneList = document.querySelector("#doneList"),
		toDoCount = document.querySelector("#toDoCount"),
		doneCount = document.querySelector("#doneCount"),
		toDoString = "",
		doneString = "",
		toDoNum = 0,
		doneNum = 0;
	toDoArr = loadData();
	toDoArr.forEach((item, index) => {
		if (!item.done) {
			toDoString += `
                <li draggable="true">
                    <input type="checkbox" onchange="changeDone(${index}, 'done', true)">
                    <p>${item.todo}</p>
                    <a href="javascript:removeToDo(${index});">x</a>
                </li>
            `;
			toDoNum++;
		} else {
			doneString += `
                <li draggable="true">
                    <input type="checkbox" checked onchange="changeDone(${index}, 'done', false)">
                    <p>${item.todo}</p>
                    <a href="javascript:removeToDo(${index});">x</a>
                </li>
            `;
			doneNum++;
		}
	});

	toDoList.innerHTML = toDoString;
	doneList.innerHTML = doneString;
	toDoCount.innerHTML = toDoNum;
	doneCount.innerHTML = doneNum;
	// 事件委托
	toDoList.addEventListener("dragstart", drapStartHandle);
	toDoList.addEventListener("dragover", drapOverHandle);
	toDoList.addEventListener("drop", dropHandle);
	doneList.addEventListener("dragstart", drapStartHandle);
	doneList.addEventListener("dragover", drapOverHandle);
	doneList.addEventListener("drop", dropHandle);
}

function changeDone(index, field, value) {
	toDoArr[index][field] = value;
	saveData(toDoArr);
	updateList();
}

function removeToDo(index) {
	toDoArr.splice(index, 1);
	saveData(toDoArr);
	updateList();
}

function clear(type) {
	toDoArr = toDoArr.filter((item) => {
		return item.done !== type;
	});
	saveData(toDoArr);
	updateList();
}

// 拖放事件
let oldLi = null;
function drapStartHandle(e) {
	if (e.target.nodeName.toLowerCase() !== "li") {
		return;
	}
	oldLi = e.target;
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/html", oldLi.innerHTML);
	// 利用了事件委托，所以this就是ul
	e.dataTransfer.setData("text", this.id);
}

function drapOverHandle(e) {
	e.preventDefault();
}

function dropHandle(e) {
	e.preventDefault();
	let currentLi = null;
	if (e.target.nodeName.toLowerCase() === "p") {
		currentLi = e.target.parentNode;
	} else if (e.target.nodeName.toLowerCase() === "li") {
		currentLi = e.target;
	} else {
		return;
	}
	let parentId = e.dataTransfer.getData("text");
	if (currentLi === oldLi || this.id !== parentId) {
		return;
	}
	oldLi.innerHTML = currentLi.innerHTML;
	currentLi.innerHTML = e.dataTransfer.getData("text/html");
}

// 保存用户数据到本地缓存
function saveData(data) {
	// localStorage的值只能保存字符串类型，所以需要将数组转换成JSON字符串类型
	localStorage.setItem("myToDoList", JSON.stringify(data));
}

// 从本地缓存中获取数据
function loadData() {
	let hisData = localStorage.getItem("myToDoList");
	if (JSON.parse(hisData)) {
		return JSON.parse(hisData);
	} else {
		return [];
	}
}

// 添加监听事件
window.addEventListener("load", updateList);
document.querySelector("#toDoText").onkeyup = function (e) {
	if (e.keyCode === 13) {
		addToDo();
	}
};
document.querySelector("#test").onkeyup = function (e) {
	if (e.keyCode === 13) {
		test();
	}
};
