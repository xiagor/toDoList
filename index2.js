let toDoArr = [],
	toDoList = document.querySelector("#toDoList"),
	doneList = document.querySelector("#doneList"),
	toDoCount = document.querySelector("#toDoCount"),
	doneCount = document.querySelector("#doneCount");

// 添加todo
function addToDo() {
	let objToDo = {
		id: +new Date(),
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
	// 创建新的节点
	let newEle = document.createElement("li");
	newEle.setAttribute("draggable", "true");
	newEle.innerHTML = `
        <input type="checkbox" onchange="changeDone(${objToDo.id}, 'done')">
        <p id="${objToDo.id}">${toDoText}</p>
        <a href="javascript:removeToDo(${objToDo.id});">x</a>
    `;
	toDoList.appendChild(newEle);
	toDoCount.innerHTML = Number(toDoCount.innerHTML) + 1;
	document.querySelector("#toDoText").value = "";
	toDoArr.push(objToDo);
	saveData("myToDoList", toDoArr);
	scrollTop("toDoList");
}

// 删除todo
function removeToDo(Id) {
	let index = toDoArr.findIndex((item) => {
		return item.id === Id;
	});
	if (toDoArr[index]["done"]) {
		doneList.removeChild(document.getElementById(Id).parentNode);
		doneCount.innerHTML = Number(doneCount.innerHTML) - 1;
	} else {
		toDoList.removeChild(document.getElementById(Id).parentNode);
		toDoCount.innerHTML = Number(toDoCount.innerHTML) - 1;
	}
	toDoArr.splice(index, 1);
	saveData("myToDoList", toDoArr);
}

// 拖放
let oldLi = null,
	oldIndex = "";
function drapStartHandle(e) {
	if (e.target.nodeName.toLowerCase() !== "li") {
		return;
	}

	oldLi = e.target;
	let pNodeId = oldLi.children[1].id;
	oldIndex = toDoArr.findIndex((item) => {
		return item.id === Number(pNodeId);
	});
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/html", oldLi.innerHTML);
	e.dataTransfer.setData("text", this.id);
}

function drapOverHandle(e) {
	e.preventDefault();
}

function dropHandle(e) {
	e.preventDefault();
	let currentLi = null,
		currentIndex = "";

	if (e.target.nodeName.toLowerCase() === "p") {
		// 拖放在文字p标签
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
	let pNodeId = currentLi.children[1].id;
	currentIndex = toDoArr.findIndex((item) => {
		return item.id === Number(pNodeId);
	});
	[toDoArr[currentIndex], toDoArr[oldIndex]] = [
		toDoArr[oldIndex],
		toDoArr[currentIndex],
	];
	saveData("myToDoList", toDoArr);
	oldLi.innerHTML = currentLi.innerHTML;
	currentLi.innerHTML = e.dataTransfer.getData("text/html");
}

// 批量清除
function clear(type) {
	toDoArr = toDoArr.filter((item) => {
		return item.done !== type;
	});
	saveData("myToDoList", toDoArr);
	loadData();
}

// 变更完成标识
function changeDone(Id, field) {
	let index = toDoArr.findIndex((item) => {
		return item.id === Id;
	});
	toDoArr[index][field] = !toDoArr[index][field];
	let newList = null,
		oldList = null,
		newCount = null,
		oldCount = null,
		changeElm = null;
	// 如果为true，就是从todo变成done的
	if (toDoArr[index][field]) {
		oldList = toDoList;
		oldCount = toDoCount;
		newList = doneList;
		newCount = doneCount;
		changeElm = oldList.removeChild(document.getElementById(Id).parentNode);
		changeElm.children[0].setAttribute("checked", true);
	} else {
		oldList = doneList;
		oldCount = doneCount;
		newList = toDoList;
		newCount = toDoCount;
		changeElm = oldList.removeChild(document.getElementById(Id).parentNode);
		changeElm.children[0].removeAttribute("checked");
	}

	oldCount.innerHTML = Number(oldCount.innerHTML) - 1;
	newList.appendChild(changeElm);
	newCount.innerHTML = Number(newCount.innerHTML) + 1;
	scrollTop(newList.id);
	toDoArr.push(toDoArr.splice(index, 1)[0]);
	saveData("myToDoList", toDoArr);
}

// 滚动条
function scrollTop(elmeId) {
	let scrollTarget = document.getElementById(elmeId);
	scrollTarget.scrollTop = scrollTarget.scrollHeight;
}

// 加载缓存的数据
function loadData() {
	let hisData = localStorage.getItem("myToDoList");
	if (!JSON.parse(hisData)) {
		return;
	}
	let toDoString = "",
		doneString = "",
		toDoNum = 0,
		doneNum = 0;
	toDoArr = JSON.parse(hisData);
	toDoArr.forEach((item) => {
		if (item.done) {
			doneString += `
                <li draggable="true">
                    <input type="checkbox" checked onchange="changeDone(${item.id}, 'done')">
                    <p id="${item.id}">${item.todo}</p>
                    <a href="javascript:removeToDo(${item.id});">x</a>
                </li>
            `;
			doneNum++;
		} else {
			toDoString += `
                <li draggable="true">
                    <input type="checkbox" onchange="changeDone(${item.id}, 'done')">
                    <p id="${item.id}">${item.todo}</p>
                    <a href="javascript:removeToDo(${item.id});">x</a>
				</li>
            `;
			toDoNum++;
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

// 保存用户数据到本地缓存
function saveData(key, data) {
	// localStorage的值只能保存字符串类型，所以需要将数组转换成JSON字符串类型
	localStorage.setItem(key, JSON.stringify(data));
}

// 添加监听事件
window.addEventListener("load", loadData);
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

// 测试函数
function test() {
	let num = document.querySelector("#test").value.trim();
	let todoStrig = "";
	for (let i = 0; i < num; i++) {
		let testobj = {
			id: +new Date() + i + Math.floor(Math.random() * 1000 + 1) / 1000,
			todo: "todo" + i,
			done: false,
		};
		todoStrig += `
			<li draggable="true">
				<input type="checkbox" onchange="changeDone(${testobj.id}, 'done')">
				<p id="${testobj.id}">${testobj.todo}</p>
				<a href="javascript:removeToDo(${testobj.id});">x</a>
			</li>
		`;
		toDoArr.push(testobj);
	}
	toDoList.innerHTML = toDoList.innerHTML + todoStrig;
	toDoCount.innerHTML = Number(toDoCount.innerHTML) + Number(num);
	document.querySelector("#test").value = "";
	saveData("myToDoList", toDoArr);
}
