---
title: "opencv思路"
published: 2026-04-06
description: ""
tags: ["电赛"]
draft: false
---
### 棋盘定位与透视变换（获取“上帝视角”）

由于摄像头安装角度很难做到完全垂直，画面中的棋盘通常是倾斜的梯形。为了方便后续处理，必须先将其“拉直”。
- **边缘提取**：利用 `cv2.Canny` 或 `cv2.threshold` 进行二值化，结合 `cv2.findContours` 寻找画面中最大的矩形轮廓。
    
- **顶点提取**：通过 `cv2.approxPolyDP` 对轮廓进行多边形拟合，得到棋盘的四个关键顶点坐标。
    
- **透视变换**：使用 `cv2.getPerspectiveTransform` 计算变换矩阵，再通过 `cv2.warpPerspective` 将倾斜的棋盘映射为一个标准的正方形图像（例如 $600 \times 600$ 像素）。这样你后续所有的坐标计算都会变成简单的等分关系。
### 网格划分与感兴趣区域（ROI）提取

有了标准的正方形棋盘图后，不需要对整张图进行复杂分析，而是要将其“数字化”。

- **几何切分**：如果是三子棋就 $3 \times 3$ 等分，如果是五子棋就 $15 \times 15$ 等分。
    
- **ROI 提取**：计算出每个格子的中心点坐标及边界，将每个小格子切成一个独立的微型图像。
###  棋子状态识别（核心环节）

这是区分“空位”、“黑子”和“白子”的阶段，有两种主流实现方案：

- **传统颜色阈值（响应快、对光照敏感）**
    
    - 将 ROI 转换到 **HSV 空间**，因为 HSV 比 RGB 更能抵抗光照强度波动。
        
    - 针对黑子和白子分别设定阈值区间，利用 `cv2.inRange` 提取掩膜，统计每个格子里对应颜色像素点的数量。如果数量超过设定阈值，则判定该位置有棋子。
###  棋盘状态编码（数字化输出）

将视觉识别的结果转化成博弈算法能理解的数据结构。

- 创建一个二维数组（矩阵），例如 `board[3][3]`。
    
- 约定：`0` 代表无子，`1` 代表机器落子，`-1` 代表人类落子。
    
- **帧过滤机制**：为了防止单帧图像的识别误差导致误判，建议加入一个简单的滤波器——比如连续 5 帧图像识别结果一致时，才更新棋盘状态数组。
```python
import cv2
import numpy as np

def order_points(pts):
    """
    对四个顶点进行排序，顺序规定为：左上、右上、右下、左下。
    这一步极其重要，如果不排序，拉直后的图像可能会发生翻转或扭曲。
    """
    # 初始化一个 4x2 的坐标矩阵
    rect = np.zeros((4, 2), dtype="float32")
    
    # 按照 x+y 的和：左上角和最小，右下角和最大
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    
    # 按照 y-x 的差：右上角差值最小，左下角差值最大
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    
    return rect

def get_perspective_transform(image):
    """
    接收一帧图像，寻找最大的四边形并将其拉直
    """
    # 1. 图像预处理
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # 高斯模糊，过滤噪点，防止识别出碎片的边缘
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    # Canny 边缘检测 (50, 150 为高低阈值，可根据你的环境光照微调)
    edged = cv2.Canny(blurred, 50, 150)

    # 2. 寻找轮廓
    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 按面积从大到小排序，只取前 5 个大轮廓加快处理速度
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    board_contour = None
    
    # 3. 遍历轮廓，寻找多边形拟合后有 4 个顶点的图形（即棋盘）
    for c in contours:
        # 计算轮廓周长
        peri = cv2.arcLength(c, True)
        # 多边形拟合，0.02*peri 是精度参数，越小越贴近原轮廓
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        
        # 如果拟合出来正好是 4 个点，我们认为找到了棋盘边框
        if len(approx) == 4:
            board_contour = approx
            break

    # 如果没找到 4 个顶点的图形，直接返回原图
    if board_contour is None:
        return image, None

    # 4. 透视变换
    # 将顶点数据转换为 4x2 的矩阵并排序
    pts = board_contour.reshape(4, 2)
    rect = order_points(pts)

    # 设定我们期望拉直后的目标图像大小 (例如 600x600 的完美正方形)
    dst_size = 600
    dst = np.array([
        [0, 0],
        [dst_size - 1, 0],
        [dst_size - 1, dst_size - 1],
        [0, dst_size - 1]
    ], dtype="float32")

    # 计算透视变换矩阵 M
    M = cv2.getPerspectiveTransform(rect, dst)
    # 进行透视拉伸
    warped = cv2.warpPerspective(image, M, (dst_size, dst_size))

    return warped, board_contour

def main():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("错误：无法打开摄像头。")
        return

    print("开始实时透视变换检测...")
    print("请把一个矩形物体（如纸上的方框、棋盘）放入视野中。按 'q' 退出。")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 拷贝一份原图用来画框，避免破坏原数据
        display_frame = frame.copy()

        # 调用我们写的函数
        warped_img, contour = get_perspective_transform(frame)

        # 如果成功找到了棋盘轮廓，在原画面上用绿线画出来，方便调试观察
        if contour is not None:
            cv2.drawContours(display_frame, [contour], -1, (0, 255, 0), 3)
            # 显示拉直后的正方形画面
            cv2.imshow('Warped Board (Top-Down View)', warped_img)

        # 显示原画面（带绿色追踪框）
        cv2.imshow('Original Camera View', display_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
```



## **网格划分与棋子状态识别**
#### 网格划分
例如将 $600 \times 600$ 的画面，像切豆腐一样均分成 $3 \times 3$ 的 9 个小格子（每个格子 $200 \times 200$ 像素）。然后，让程序去观察每个小格子里的像素，判断它是**空位**、**黑子**还是**白子**。
### 核心实现逻辑

1. **切片提取 (ROI)**：使用 NumPy 的数组切片功能，提取出每个格子的画面。为了防止棋盘画线的黑边干扰识别，我们只提取每个格子**最中心**的那一小块区域（Region of Interest, 简称 ROI）。
    
2. **灰度值分析**：将 ROI 转换成灰度图。
    
    - 如果里面有**黑子**，这块区域的平均像素值会非常低（趋近于 0）。
        
    - 如果里面有**白子**，平均像素值会非常高（趋近于 255）。
        
    - 如果是**空位**（露出棋盘底色），平均像素值会介于中间。
### 新增的识别代码

你可以将下面这个新函数添加到你之前的代码中（放在 `get_perspective_transform` 函数的下面）：
```python
def get_board_state(warped_img):
    """
    接收 600x600 的拉直棋盘图像，识别 3x3 网格的状态
    返回一个 3x3 的二维数组：0 代表空，1 代表黑子，2 代表白子
    """
    # 初始化一个 3x3 的全零矩阵
    board_matrix = np.zeros((3, 3), dtype=int)
    
    # 因为图像是 600x600，3等分的话每个格子长宽都是 200
    grid_size = 200 
    
    # 遍历 3 行 3 列
    for row in range(3):
        for col in range(3):
            # 计算当前格子的像素坐标边界
            y_start = row * grid_size
            y_end = (row + 1) * grid_size
            x_start = col * grid_size
            x_end = (col + 1) * grid_size
            
            # 从整张图中切出这个小格子 (200x200)
            cell_img = warped_img[y_start:y_end, x_start:x_end]
            
            # 为了避开棋盘网格线的干扰，我们向内收缩 60 像素，只看格子最中间的 80x80 区域
            margin = 60
            roi = cell_img[margin : grid_size - margin, margin : grid_size - margin]
            
            # 转为单通道灰度图
            gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            
            # 计算这片中心区域的平均亮度值
            mean_val = np.mean(gray_roi)
            
            # --- 核心判断逻辑 (这里的阈值需要根据你的实际环境光线微调) ---
            # 假设黑子极暗，白子极亮，棋盘底色是灰黄/木色
            if mean_val < 80:
                board_matrix[row][col] = 1  # 认为是黑子
                # 在拉直的图像上打个标记，方便调试看效果
                cv2.putText(warped_img, "Black", (x_start + 50, y_start + 100), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
                            
            elif mean_val > 180:
                board_matrix[row][col] = 2  # 认为是白子
                cv2.putText(warped_img, "White", (x_start + 50, y_start + 100), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                            
            else:
                board_matrix[row][col] = 0  # 认为是空位
                
            # 画出我们提取 ROI 的中心小方框，方便你在画面里直观看到程序在“看”哪里
            cv2.rectangle(warped_img, 
                          (x_start + margin, y_start + margin), 
                          (x_end - margin, y_end - margin), 
                          (255, 255, 0), 1)

    return board_matrix, warped_img
```
随后在主循环中调用即可
# **博弈决策**
### **minimax算法***
确认了稳定的棋盘状态后，就需要算出最优解。对于三子棋，状态空间非常小，我们直接使用 **Minimax 算法**。 它的逻辑是：穷举未来所有可能的走法，假设人类每次都走最强的一步，机器每次也走最强的一步。最后选择那个能保证自己“最差也是平局”的落子点。
机器在落子之前，会在脑海里疯狂推演未来所有可能发生的时间线，直到对局结束，然后选出一条对自己最有利的路线。
### 1. 终局评分机制（对应 `evaluate` 函数）

当机器在脑海中推演到某一步时，游戏结束了。程序需要一个“裁判”来给这个结局打分：

- **机器（白子）赢了**：得 **+10** 分（极其理想）。
    
- **人类（黑子）赢了**：得 **-10** 分（极其糟糕）。
    
- **棋盘满了且平局**：得 **0** 分。
    
### 2. 极小化与极大化（核心博弈逻辑）

为什么叫 Mini-Max？因为算法设定了两个绝对理性的对立面：

- **Max（极大化）**：机器的轮次。机器总是希望得分越高越好，它会努力寻找能通向 **+10** 分的分支。
    
- **Min（极小化）**：人类的轮次。算法**假设人类也是个绝顶高手**，绝对不会走废棋。所以当脑海中推演到人类下棋时，算法会认为人类一定会选择让机器得分最低（**-10** 分）的走法。
    
在推演时，机器会想：“如果我走这步，人类一定会走那步来堵我；如果他堵我，我下一步再走这里……” 双方各自为了自己的最大利益（Max 和 Min）做出最优选择。
### 3. 递归树形搜索（对应 `minimax` 函数）

这是算法的“时间机器”。它通过**递归**（函数自己调用自己）来遍历所有未来的可能性：

1. 拿到当前棋盘。
    
2. 尝试在第一个空位落下一颗机器的棋子。
    
3. **身份翻转**：现在轮到人类了，调用自己，推演人类的所有可能回应。
    
4. 一直往下推演，直到分出胜负（触发评分机制），然后把分数一层层往上返回。
    
5. 把刚才落下的棋子拿走（回溯），换下一个空位继续尝试。
    

最终，每一种尝试落子的方案，都会得到一个评估分数。
### 4. 一个天才细节：深度惩罚 (Depth)

仔细看代码里的这两行：

- 机器赢：`return score - depth`
    
- 人类赢：`return score + depth`
    
`depth` 指的是脑海中推演的“回合数”。为什么要加减回合数？
- **如果机器能赢**：它是在第 2 步赢好，还是在第 4 步赢好？当然是越快越好！所以减去 `depth`。第 2 步赢的得分是 `10 - 2 = 8`，第 4 步赢的得分是 `10 - 4 = 6`。算法会自动选择更快赢的走法。
    
- **如果机器注定要输**：算法会选择“抵抗得最久”的走法，因为加上了 `depth`，拖延的回合越多，扣分越少。
```python
import cv2
import numpy as np

# ==========================================
# 1. 核心算法部分 (大脑)
# ==========================================
PLAYER = 1   # 人类 (黑子)
MACHINE = 2  # 机器 (白子)

def is_moves_left(board):
    for row in range(3):
        for col in range(3):
            if board[row][col] == 0: return True
    return False

def evaluate(board):
    for row in range(3):
        if board[row][0] == board[row][1] == board[row][2]:
            if board[row][0] == MACHINE: return 10
            elif board[row][0] == PLAYER: return -10
    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col]:
            if board[0][col] == MACHINE: return 10
            elif board[0][col] == PLAYER: return -10
    if board[0][0] == board[1][1] == board[2][2]:
        if board[0][0] == MACHINE: return 10
        elif board[0][0] == PLAYER: return -10
    if board[0][2] == board[1][1] == board[2][0]:
        if board[0][2] == MACHINE: return 10
        elif board[0][2] == PLAYER: return -10
    return 0

def minimax(board, depth, is_max):
    score = evaluate(board)
    if score == 10: return score - depth
    if score == -10: return score + depth
    if not is_moves_left(board): return 0

    if is_max:
        best = -1000
        for i in range(3):
            for j in range(3):
                if board[i][j] == 0:
                    board[i][j] = MACHINE
                    best = max(best, minimax(board, depth + 1, not is_max))
                    board[i][j] = 0
        return best
    else:
        best = 1000
        for i in range(3):
            for j in range(3):
                if board[i][j] == 0:
                    board[i][j] = PLAYER
                    best = min(best, minimax(board, depth + 1, not is_max))
                    board[i][j] = 0
        return best

def find_best_move(board):
    best_val = -1000
    best_move = (-1, -1)
    # 必须传入 board 的拷贝，防止修改原状态
    temp_board = board.copy() 
    for i in range(3):
        for j in range(3):
            if temp_board[i][j] == 0:
                temp_board[i][j] = MACHINE
                move_val = minimax(temp_board, 0, False)
                temp_board[i][j] = 0
                if move_val > best_val:
                    best_move = (i, j)
                    best_val = move_val
    return best_move

# ==========================================
# 2. 视觉识别部分 (眼睛)
# ==========================================
def order_points(pts):
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def get_perspective_transform(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 75, 150)
    contours, _ = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
    
    board_contour = None
    for contour in contours:
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
        if len(approx) == 4:
            board_contour = approx
            break
            
    if board_contour is None:
        return image, None
        
    pts = board_contour.reshape(4, 2)
    rect = order_points(pts)
    dst_size = 600
    dst = np.array([
        [0, 0], [dst_size - 1, 0], 
        [dst_size - 1, dst_size - 1], [0, dst_size - 1]
    ], dtype="float32")
    
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (dst_size, dst_size))
    return warped, board_contour

def get_board_state(warped_img):
    board_matrix = np.zeros((3, 3), dtype=int)
    grid_size = 200
    
    for row in range(3):
        for col in range(3):
            y_start, y_end = row * grid_size, (row + 1) * grid_size
            x_start, x_end = col * grid_size, (col + 1) * grid_size
            
            margin = 60
            roi = warped_img[y_start+margin:y_end-margin, x_start+margin:x_end-margin]
            gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            mean_val = np.mean(gray_roi)
            
            cv2.rectangle(warped_img, 
                          (x_start + margin, y_start + margin), 
                          (x_end - margin, y_end - margin), 
                          (255, 255, 0), 1)
            
            if mean_val < 80:
                board_matrix[row][col] = 1  # 黑子
                cv2.putText(warped_img, "Black", (x_start + 50, y_start + 110), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)            
            elif mean_val > 180:
                board_matrix[row][col] = 2  # 白子
                cv2.putText(warped_img, "White", (x_start + 50, y_start + 110), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            else:
                board_matrix[row][col] = 0  # 空位
                
    return board_matrix, warped_img

# ==========================================
# 3. 主控制流 (神经闭环)
# ==========================================
def main():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("错误：无法打开摄像头")
        return
        
    print("系统已启动。按 'q' 退出。")
    
    # 状态滤波变量
    last_board = np.zeros((3, 3), dtype=int)
    stable_frames = 0
    machine_target_move = None

    while True:
        ret, frame = cap.read()
        if not ret: break
        
        display_frame = frame.copy()
        warped_img, contour = get_perspective_transform(frame)
        
        if contour is not None:
            cv2.drawContours(display_frame, [contour], -1, (0, 255, 0), 3)
            current_board, annotated_img = get_board_state(warped_img)
            
            # 1. 棋盘状态防抖逻辑
            if np.array_equal(current_board, last_board):
                stable_frames += 1
            else:
                stable_frames = 0
                last_board = current_board.copy()
                machine_target_move = None # 棋局变动，取消当前计划
            
            # 2. 如果棋盘稳定了约 0.5 秒
            if stable_frames > 15:
                human_count = np.count_nonzero(current_board == 1)
                machine_count = np.count_nonzero(current_board == 2)
                
                # 假设人类执黑先手。如果黑子数量 > 白子数量，说明轮到机器走了
                if human_count > machine_count:
                    if machine_target_move is None:
                        print("检测到人类落子，机器正在思考...")
                        machine_target_move = find_best_move(current_board)
                        print(f"机器决定下在: 行 {machine_target_move[0]}, 列 {machine_target_move[1]}")
                else:
                    # 等待人类落子
                    machine_target_move = None
            
            # 3. 在画面上绘制机器计划落子的目标位置
            if machine_target_move is not None:
                r, c = machine_target_move
                if r != -1 and c != -1:
                    # 计算目标网格的中心坐标
                    center_x = c * 200 + 100
                    center_y = r * 200 + 100
                    # 画一个显眼的品红色准星 🎯
                    cv2.circle(annotated_img, (center_x, center_y), 30, (255, 0, 255), 4)
                    cv2.drawMarker(annotated_img, (center_x, center_y), (255, 0, 255), markerType=cv2.MARKER_CROSS, markerSize=40, thickness=4)
                    cv2.putText(annotated_img, "TARGET", (center_x - 40, center_y - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 255), 2)
            
            cv2.imshow('AI Brain Output', annotated_img)
            
        cv2.imshow('Original View', display_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
```
### 引入一个高中数学和大学线性代数里的核心武器：**二维坐标旋转矩阵 (2D Rotation Matrix)**。
### 核心数学原理：旋转矩阵

假设我们将 5 号格子（棋盘正中心）作为旋转的圆心，物理坐标为 $(X_c, Y_c)$。

假设相邻格子的间距为 $L$（比如 50 毫米）。

在棋盘**没有旋转**时，以 5 号为中心，各个格子的**本地相对坐标 (Local X, Local Y)** 是固定的：

- 5 号位（中心）：$(0, 0)$
    
- 1 号位（左上）：$(-L, -L)$
    
- 6 号位（右中）：$(+L, 0)$
    
- ...以此类推。
    
当棋盘绕着中心旋转了 $\theta$ 角度后，我们如何求 1 号位在电机世界里的**真实物理坐标 $(X_{target}, Y_{target})$** 呢？公式如下：

1. **先计算旋转后的相对位置：**
    
    $x_{new} = Local_X \cdot \cos(\theta) - Local_Y \cdot \sin(\theta)$
    
    $y_{new} = Local_X \cdot \sin(\theta) + Local_Y \cdot \cos(\theta)$
    
2. **加上中心点的绝对位置（平移）：**
    
    $X_{target} = X_c + x_{new}$
    
    $Y_{target} = Y_c + y_{new}$
**树莓派算出了倾斜后的 X 和 Y，为什么下棋时却只发一个干瘪瘪的 ID（比如 5 号），那 X 和 Y 岂不是白算了？**
一句话解释：**坐标变换确实用到了，但它是被“提前存进了 STM32 的脑子里”，而不是在每次下棋时临时发过去的。**
我们可以用**“手机通讯录”**来打个比方：
1. **ID（1-9号格子）** 就像是你通讯录里的**“联系人名字”**（比如：张三、李四）。
2. **物理坐标（X, Y）** 就像是他们的**“电话号码”**。
在咱们的系统里，分为两个完全独立的阶段：
### 阶段一：标定阶段（更新通讯录）—— 真正用到坐标变换的地方
比赛一开始，评委把棋盘歪着放好。 树莓派（OpenCV）一看，说：“哎呀，棋盘转了 30 度，张三（1号格子）的电话号码变了！” 这时候，树莓派运行咱们写的三角函数，算出 9 个格子**全新的物理坐标（新电话号码）**。 然后，树莓派通过串口发送 **`05` 功能码**的“标定包”。 这个包的意思是：**“STM32 老弟，打开你的备忘录，把 1 到 9 号的坐标全部划掉，换成我刚给你算的这一批新坐标！”** STM32 收到后，把新坐标存进了自己的数组里。**此时，坐标变换的成果已经成功转移到了 STM32 体内。**
### 阶段二：下棋阶段（打电话）—— 只发 ID
游戏正式开始。树莓派的 AI 算出来：“这步棋应该下在 1 号位！” 这时候，树莓派**不需要**再去查 1 号位的坐标是多少，它只需要发送 **`01` 功能码**的“下棋包”：`AA 01 01 FF`。 这个包的意思极其简单：**“STM32 老弟，给‘张三（1号位）’打电话！”**
STM32 收到指令后，去翻自己的备忘录。因为在阶段一的时候，备忘录已经被更新过了，所以 STM32 翻出来的，**正是倾斜过后的、正确的物理坐标。** 然后电机就开过去了。
```python
import cv2
import numpy as np
import serial
import time
import math
import threading

# ==========================================
# 0. 硬件接口与全局变量配置
# ==========================================
try:
    # 注意：如果用PH1.0端子，请改为 '/dev/serial0'
    ser = serial.Serial('/dev/ttyUSB0', 115200, timeout=0.1)
    print("✅ 串口连接成功！")
except:
    ser = None
    print("⚠️ 警告：未检测到串口设备，系统进入模拟模式。")

# --- 核心状态锁与记忆数组 ---
waiting_for_stm32 = False      # 视觉锁定标志（机器动手时，树莓派闭眼）
robot_white_memory = []        # 官方记忆：记录机器下过的白子位置ID (1-9)
last_board = np.zeros((3, 3), dtype=int) # 全局维护的棋盘状态

def send_unified_cmd(ser_obj, cmd, payload_list):
    """ 实现 V1.0 协议打包发送 (包头AA + 功能码 + 长度 + 数据 + 校验和 + 包尾FF) """
    length = len(payload_list)
    checksum = (cmd + length + sum(payload_list)) & 0xFF
    frame = [0xAA, cmd, length] + payload_list + [checksum, 0xFF]
    if ser_obj is not None:
        ser_obj.write(bytearray(frame))
    return frame

# ==========================================
# 1. AI 决策引擎 (Minimax 算法)
# ==========================================
PLAYER = 1   # 黑子 (人类)
MACHINE = 2  # 白子 (机器)

def evaluate(board):
    """ 评估棋盘状态，判断是否有赢家 """
    for row in range(3):
        if board[row][0] == board[row][1] == board[row][2] != 0:
            return 10 if board[row][0] == MACHINE else -10
    for col in range(3):
        if board[0][col] == board[1][col] == board[2][col] != 0:
            return 10 if board[0][col] == MACHINE else -10
    if board[0][0] == board[1][1] == board[2][2] != 0:
        return 10 if board[0][0] == MACHINE else -10
    if board[0][2] == board[1][1] == board[2][0] != 0:
        return 10 if board[0][2] == MACHINE else -10
    return 0

def minimax(board, depth, is_max):
    """ 极大极小值算法核心 """
    score = evaluate(board)
    if score == 10 or score == -10: return score
    if not np.any(board == 0): return 0

    if is_max:
        best = -1000
        for i in range(3):
            for j in range(3):
                if board[i][j] == 0:
                    board[i][j] = MACHINE
                    best = max(best, minimax(board, depth + 1, False))
                    board[i][j] = 0
        return best
    else:
        best = 1000
        for i in range(3):
            for j in range(3):
                if board[i][j] == 0:
                    board[i][j] = PLAYER
                    best = min(best, minimax(board, depth + 1, True))
                    board[i][j] = 0
        return best

def find_best_move(board):
    """ 寻找当前局面下的机器最优解 """
    best_val = -1000
    move = (-1, -1)
    for i in range(3):
        for j in range(3):
            if board[i][j] == 0:
                board[i][j] = MACHINE
                move_val = minimax(board, 0, False)
                board[i][j] = 0
                if move_val > best_val:
                    move = (i, j)
                    best_val = move_val
    return move

# ==========================================
# 2. 空间映射逻辑 (手眼旋转变换)
# ==========================================
def calculate_physical_coordinates(center_motor_x, center_motor_y, angle_deg, grid_spacing):
    """ 根据中心点和角度，计算 9 个格子的电机绝对脉冲坐标 """
    angle_rad = math.radians(angle_deg)
    cos_a, sin_a = math.cos(angle_rad), math.sin(angle_rad)
    
    local_offsets = {
        1: (-grid_spacing, -grid_spacing), 2: (0, -grid_spacing), 3: (grid_spacing, -grid_spacing),
        4: (-grid_spacing, 0),             5: (0, 0),             6: (grid_spacing, 0),
        7: (-grid_spacing, grid_spacing),  8: (0, grid_spacing),  9: (grid_spacing, grid_spacing)
    }
    physical_coords = {}
    for logic_id, (lx, ly) in local_offsets.items():
        rx = lx * cos_a - ly * sin_a
        ry = lx * sin_a + ly * cos_a
        physical_coords[logic_id] = (int(center_motor_x + rx), int(center_motor_y + ry))
    return physical_coords

# ==========================================
# 3. 视觉识别系统 (OpenCV)
# ==========================================
def get_perspective_transform(image):
    """ 寻找棋盘轮廓并进行透视拉正 """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(cv2.GaussianBlur(gray, (5, 5), 0), 75, 150)
    contours_info = cv2.findContours(edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours_info[0] if len(contours_info) == 2 else contours_info[1]
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
    
    board_contour = None
    for contour in contours:
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
        if len(approx) == 4:
            board_contour = approx
            break
            
    if board_contour is None: return image, None, 0, (0,0)
        
    min_rect = cv2.minAreaRect(board_contour)
    center_pt, angle = min_rect[0], min_rect[2]
    if angle > 45: angle -= 90 

    pts = board_contour.reshape(4, 2)
    s = pts.sum(axis=1)
    rect = np.zeros((4, 2), dtype="float32")
    rect[0], rect[2] = pts[np.argmin(s)], pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1], rect[3] = pts[np.argmin(diff)], pts[np.argmax(diff)]

    dst_size = 600
    dst = np.array([[0,0],[dst_size-1,0],[dst_size-1,dst_size-1],[0,dst_size-1]], dtype="float32")
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (dst_size, dst_size))
    return warped, board_contour, angle, center_pt

def get_board_state(warped_img):
    """ 切割拉正后的图像，识别 3x3 棋局状态 """
    board_matrix = np.zeros((3, 3), dtype=int)
    grid = 200
    for r in range(3):
        for c in range(3):
            roi = warped_img[r*grid+40:(r+1)*grid-40, c*grid+40:(c+1)*grid-40]
            v_mean = np.mean(cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)[:,:,2]) 
            
            if v_mean < 70: board_matrix[r][c] = 1   # 黑子
            elif v_mean > 140: board_matrix[r][c] = 2 # 白子
    return board_matrix, warped_img

# ==========================================
# 4. 后台串口监听线程 
# ==========================================
def serial_receive_thread():
    global waiting_for_stm32, last_board, robot_white_memory
    buffer = bytearray()
    
    while True:
        if ser and ser.in_waiting > 0:
            buffer.extend(ser.read(ser.in_waiting))
            while len(buffer) >= 6:
                if buffer[0] == 0xAA:
                    length = buffer[2]
                    if len(buffer) >= length + 5: 
                        cmd = buffer[1]
                        data = list(buffer[3:3+length])
                        checksum = buffer[3+length]
                        footer = buffer[4+length]
                        
                        calc_sum = (cmd + length + sum(data)) & 0xFF
                        if calc_sum == checksum and footer == 0xFF:
                            
                            # --- 【0x06】玩家落子 ---
                            if cmd == 0x06:
                                human_id = data[0]
                                print(f"\n👤 HMI指令: 玩家在 {human_id} 号位落子，启动 AI 思考...")
                                r, c = (human_id - 1) // 3, (human_id - 1) % 3
                                last_board[r][c] = 1 
                                
                                move = find_best_move(last_board) 
                                if move != (-1, -1):
                                    target_id = move[0] * 3 + move[1] + 1
                                    robot_white_memory.append(target_id) 
                                    last_board[move[0]][move[1]] = 2     
                                    print(f"🤖 AI 决定下在：{target_id} 号位")
                                    send_unified_cmd(ser, 0x01, [target_id])
                                    waiting_for_stm32 = True                 
                                    
                            # --- 【0x03】动作完成 ---
                            elif cmd == 0x03:
                                print("✅ 机械臂动作归位完成，解除视觉锁定。\n")
                                waiting_for_stm32 = False

                            # --- 【0x09】全局复位 ---
                            elif cmd == 0x09:
                                print("\n🔄 收到 0x09 全局复位指令！正在执行软复位...")
                                robot_white_memory.clear()               
                                last_board = np.zeros((3, 3), dtype=int) 
                                waiting_for_stm32 = False                
                                print("✅ 记忆已清空，视觉锁已解除，系统准备好迎接新一局。\n")
                                
                        buffer = buffer[5+length:] 
                    else:
                        break 
                else:
                    buffer.pop(0) 
        time.sleep(0.01)

# ==========================================
# 5. 主控制流 
# ==========================================
def main():
    global waiting_for_stm32, last_board, robot_white_memory
    
    threading.Thread(target=serial_receive_thread, daemon=True).start()
    
    # 【已修改】：使用2号摄像头设备
    cap = cv2.VideoCapture(2)
    stable_frames = 0
    print("🚀 系统启动。按 'c' 标定，按 'q' 退出。")
    while True:
        if waiting_for_stm32:
            cv2.waitKey(1)
            continue

        ret, frame = cap.read()
        if not ret: 
            print("❌ 警告：无法获取画面！请检查摄像头连接。")
            time.sleep(2)
            break
        
        warped, contour, angle, center_pt = get_perspective_transform(frame)
        
        if contour is not None:
            current_board, _ = get_board_state(warped)
            
            if np.array_equal(current_board, last_board):
                stable_frames += 1
            else:
                stable_frames = 0
            
            # --- 🏆 10分项：高级视觉纠错 (防篡改与移位复原) ---
            if stable_frames > 15:
                missing_pos = None  
                extra_pos = None    
                
                for target_id in robot_white_memory:
                    r, c = (target_id - 1) // 3, (target_id - 1) % 3
                    if current_board[r][c] != 2:
                        missing_pos = target_id
                        break
                
                if missing_pos is not None:
                    for i in range(1, 10):
                        r, c = (i - 1) // 3, (i - 1) % 3
                        if current_board[r][c] == 2 and i not in robot_white_memory:
                            extra_pos = i
                            break
                
                if missing_pos is not None and extra_pos is not None:
                    print(f"🚨 警报：检测到 {missing_pos} 号白子被非法挪到了 {extra_pos} 号位！")
                    print("🛠️ 启动移位复原协议，命令机械臂追回棋子...")
                    send_unified_cmd(ser, 0x08, [extra_pos, missing_pos])
                    waiting_for_stm32 = True 
            
            cv2.drawContours(frame, [contour], -1, (0, 255, 0), 2)
        
        # 显示最终画面 (如果物理屏幕比例极其特殊，可以解除下一行的注释进行暴力拉伸)
	    frame = cv2.resize(frame, (1920, 1080))
        cv2.imshow('Camera', frame)
        
        # 键盘标定交互
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'): break
        elif key == ord('c'):
            # TODO: 请根据你实际标定的比例尺和偏移量修改这四个值
            K_X, K_Y = 50.0, 50.0 
            OFF_X, OFF_Y = 0, 0
            grid_p = 4000 
            
            mx = int(OFF_X + center_pt[0] * K_X)
            my = int(OFF_Y + center_pt[1] * K_Y)
            
            coords = calculate_physical_coordinates(mx, my, angle, grid_p)
            for cid, (px, py) in coords.items():
                send_unified_cmd(ser, 0x05, [cid, (px>>8)&0xFF, px&0xFF, (py>>8)&0xFF, py&0xFF])
                time.sleep(0.05)
                
            robot_white_memory.clear() 
            last_board = np.zeros((3, 3), dtype=int) 
            print("✅ 动态地图下发完毕，进入待命状态。")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
