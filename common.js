var settings = {
	// pannel面板的长度
	pannelSize: 10,
	// 贪吃蛇移动的速度
	speed: 500,
	// 贪吃蛇工作线程
	workThread: null,
}

function setPannel(size) {
	var content = []
	content.push('<table>')
	for (let i = 0; i < size; i++) {
		content.push('<tr>')
		for (let j = 0; j < size; j++) {
			content.push('<td class="td_' + i + '_' + j + '"></td>')
		}
		content.push('</tr>')
	}
	content.push('</table>')
	$('#pannel').html(content.join(''))
}
setPannel(settings.pannelSize)

var Direction = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39
}

function Position(x, y) {
	// 距离X轴长度，取值范围0~pannelSize-1
	this.X = x || 0
	// 距离Y轴长度，取值范围0~pannelSize-1
	this.Y = y || 0
}

function Food() {
	this.pos = null
	// 随机产生Food坐标点，避开蛇身
	this.Create = function () {
		if (this.pos) {
			this.handleDot(false, this.pos, 'food')
		}
		let isOk = true
		while (isOk) {
			let x = parseInt(Math.random() * settings.pannelSize),
				y = parseInt(Math.random() * settings.pannelSize)
			if (!$('.td_' + x + '_' + y).hasClass('body')) {
				isOk = false
				let pos = new Position(x, y)
				this.handleDot(true, pos, 'food')
				this.pos = pos
			}
		}
	}
	// 画点
	this.handleDot = function (flag, dot, className) {
		if (flag) {
			$('.td_' + dot.X + '_' + dot.Y).addClass(className)
		} else {
			$('.td_' + dot.X + '_' + dot.Y).removeClass(className)
		}
	}
}

function Snake(myFood) {
	// 蛇的身体
	this.body = []
	// 蛇的方向
	this.dir = Direction.DOWN
	// 蛇的食物
	this.food = myFood
	// 创造蛇身
	this.Create = function () {
		let isOk = true
		while (isOk) {
			let x = parseInt(Math.random() * (settings.pannelSize - 2)) + 1,
				y = parseInt(Math.random() * (settings.pannelSize - 2)) + 1
			if (!$('.td_' + x + '_' + y).hasClass('food')) {
				isOk = false
				let pos = new Position(x, y)
				this.handleDot(true, pos, 'body')
				this.body.push(pos)
			}
		}
	}
	this.handleDot = function (flag, dot, className) {
		if (flag) {
			$('.td_' + dot.X + '_' + dot.Y).addClass(className)
		} else {
			$('.td_' + dot.X + '_' + dot.Y).removeClass(className)
		}
	}
}
this.Move = function () {
	let oldHead = Object.assign(new Position(), this.body[0]),
		oldTail = Object.assign(new Position(), this.body[this.body]),
		newHead = Object.assign(new Position(), oldHead)
	switch (this.dir) {
	case Direction.UP:
		newHead.X = newHead.X - 1
		break
	case Direction.DOWN:
		newHead.X = newHead.X + 1
		break
	case Direction.LEFT:
		newHead.Y = newHead.Y - 1
		break
	case Direction.RIGHT:
		newHead.Y = newHead.Y + 1
		break
	default:
		break
	}
	// 数组添头
	this.body.unshift(newHead)
	// 数组去尾
	this.body.pop()
	this.Move = function(){
		// ...数组操作
		if(this.eatFood()){
			this.body.push(oldTail)
			this.food.Create()
			this.rePaint(true, newHead, oldTail)
		} else if(this.konckWall() || this.konckBody()) {
			this.Over()
		} else {
			this.rePaint(false, newHead, oldTail)
		}
	}
	this.Over = function(){
		clearInterval(settings.workThread)
	}
	this.rePaint = function(isEatFood, newHead, oldTail){
		if(isEatFood){
			this.handleDot(true, newHead, 'body')
		} else {
			this.handleDot(true, newHead, 'body')
			this.handleDot(false, oldTail, 'body')
		}
	}
}

// 食物检测
this.eatFood = function () {
	let newHead = this.body[0]
	if (newHead.X == this.food.pos.X && newHead.Y == this.food.pos.Y) {
		return true
	} else {
		return false
	}
}
// 边界检测
this.konckWall = function () {
	let newHead = this.body[0]
	if (newHead.X == -1 ||
		newHead.Y == -1 ||
		newHead.X == settings.pannelSize ||
		newHead.Y == settings.pannelSize) {
		return true
	} else {
		return false
	}
}
// 蛇身检测
this.konckBody = function () {
	let newHead = this.body[0],
		flag = false
	this.body.map(function (elem, index) {
		if (index == 0)
			return
		if (elem.X == newHead.X && elem.Y == newHead.Y) {
			flag = true
		}
	})
	return flag
}

function Control() {
	this.snake = null
	// 按钮的事件绑定
	this.bindClick = function () {
		var that = this
		$(document).on('keydown', function (e) {
			if (!that.snake)
				return
			var canChangrDir = true
			switch (e.keyCode) {
			case Direction.DOWN:
				if (that.snake.dir == Direction.UP) {
					canChangrDir = false
				}
				break
			case Direction.UP:
				if (that.snake.dir == Direction.DOWN) {
					canChangrDir = false
				}
				break
			case Direction.LEFT:
				if (that.snake.dir == Direction.RIGHT) {
					canChangrDir = false
				}
				break
			case Direction.RIGHT:
				if (that.snake.dir == Direction.LEFT) {
					canChangrDir = false
				}
				break
			default:
				canChangrDir = false
				break
			}
			if (canChangrDir) {
				that.snake.dir = e.keyCode
			}
		})
		$('#palSize').on('change', function () {
			settings.pannelSize = $(this).val()
			setPannel(settings.pannelSize)
		})
		$('#palSpeed').on('change', function () {
			settings.speed = $(this).val()
		})
		$('#startBtn').on('click', function () {
			$('.food').removeClass('food')
			$('.body').removeClass('body')
			that.startGame()
		})
	}
	// 初始化
	this.init = function () {
		this.bindClick()
		setPannel(settings.pannelSize)
	}
	// 开始游戏
	this.startGame = function () {
		var food = new Food()
		food.Create()
		var snake = new Snake(food)
		snake.Create()
		this.snake = snake
		settings.workThread = setInterval(function () {
			snake.Move()
		}, settings.speed)
	}
	this.init()
}