const fs = require('fs');
const path = require('path');

const outFile = path.resolve(__dirname, '..', 'thinking', 'ER设计', '宿舍系统ER图.drawio');
let nextId = 2;

const independent = {
  '用户账号': [['用户账号标识','bigint','主标识'],['登录账号','string','业务唯一'],['密码摘要','string',''],['真实姓名','string',''],['联系电话','string',''],['电子邮箱','string','可选'],['账号启用状态','boolean',''],['账号创建时间','datetime',''],['账号更新时间','datetime','']],
  '角色': [['角色标识','bigint','主标识'],['角色编码','string','业务唯一'],['角色名称','string',''],['角色启用状态','boolean',''],['角色说明','string','可选']],
  '权限': [['权限标识','bigint','主标识'],['权限编码','string','业务唯一'],['权限名称','string',''],['权限类型','string',''],['权限启用状态','boolean',''],['权限说明','string','可选']],
  '学生资料': [['学生资料标识','bigint','主标识'],['学号','string','业务唯一'],['院系名称','string',''],['专业名称','string',''],['班级名称','string',''],['学生在籍状态','string',''],['年级','string','可选'],['性别','string','可选']],
  '宿管资料': [['宿管资料标识','bigint','主标识'],['宿管工号','string','业务唯一'],['宿管在岗状态','boolean',''],['宿管备注','string','可选']],
  '维修人员资料': [['维修人员资料标识','bigint','主标识'],['维修人员工号','string','业务唯一'],['维修人员在岗状态','boolean',''],['最大在办工单数','bigint',''],['维修人员备注','string','可选']],
  '楼栋': [['楼栋标识','bigint','主标识'],['楼栋名称','string','业务唯一'],['楼栋地址','string',''],['楼栋性别限制','string',''],['楼栋使用状态','string',''],['楼栋说明','string','可选']],
  '宿舍': [['宿舍标识','bigint','主标识'],['宿舍编号','string','局部业务唯一'],['宿舍楼层','bigint',''],['宿舍容量','bigint',''],['宿舍使用状态','string',''],['宿舍说明','string','可选']],
  '床位': [['床位标识','bigint','主标识'],['床位编号','string','局部业务唯一'],['床位管理状态','string','可用/维修/停用'],['床位说明','string','可选']],
  '故障分类': [['故障分类标识','bigint','主标识'],['故障分类名称','string','业务唯一'],['是否属于校内维修范围','boolean',''],['故障分类启用状态','boolean',''],['故障分类说明','string','可选']],
  '维修工种': [['维修工种标识','bigint','主标识'],['维修工种名称','string','业务唯一'],['维修工种启用状态','boolean',''],['维修工种说明','string','可选']],
  '报修规则': [['报修规则标识','bigint','主标识'],['规则名称','string',''],['接单超时分钟数','bigint',''],['普通维修时限','bigint',''],['紧急维修时限','bigint',''],['确认超时天数','bigint',''],['待修改关闭天数','bigint',''],['重修次数上限','bigint',''],['规则生效开始时间','datetime',''],['规则生效结束时间','datetime','可选'],['规则启用状态','boolean','']],
  '报修工单': [['报修工单标识','bigint','主标识'],['工单编号','string','业务唯一'],['工单当前状态','string',''],['紧急标记','boolean',''],['异常标记','boolean',''],['工单创建时间','datetime',''],['工单归档时间','datetime','可选']],
  '维修结果': [['维修结果标识','bigint','主标识'],['维修说明','string',''],['维修结果提交时间','datetime','']],
  '维修评价': [['维修评价标识','bigint','主标识'],['评分','bigint',''],['评价内容','string',''],['评价时间','datetime','']],
  '文件资源': [['文件资源标识','bigint','主标识'],['原始文件名称','string',''],['存储文件名称','string','业务唯一'],['文件访问地址','string',''],['文件类型','string',''],['文件大小','bigint',''],['文件摘要','string','可选'],['上传时间','datetime',''],['文件状态','string','']],
  '留宿批次': [['留宿批次标识','bigint','主标识'],['批次名称','string','业务唯一'],['假期类型','string',''],['连续开放开始日期','date',''],['连续开放结束日期','date',''],['批次说明','string',''],['批次当前状态','string','']],
  '留宿申请': [['留宿申请标识','bigint','主标识'],['申请来源','string',''],['申请当前状态','string',''],['申请锁定状态','boolean',''],['归档原因','string','可选'],['申请创建时间','datetime','']],
  '站内消息': [['站内消息标识','bigint','主标识'],['消息标题','string',''],['消息正文','string',''],['消息类型','string',''],['消息发布时间','datetime',''],['消息发送状态','string','']],
  '登录日志': [['登录日志标识','bigint','主标识'],['登录时间','datetime',''],['登录结果','string',''],['登录来源地址','string','可选'],['登录设备信息','string','可选'],['失败原因','string','可选']],
  '导入导出任务': [['导入导出任务标识','bigint','主标识'],['任务编号','string','业务唯一'],['任务类型','string',''],['业务对象类型','string',''],['任务状态','string',''],['任务创建时间','datetime',''],['任务开始时间','datetime','可选'],['任务结束时间','datetime','可选'],['执行结果说明','string','可选']],
  '备份任务': [['备份任务标识','bigint','主标识'],['任务编号','string','业务唯一'],['任务类型','string',''],['备份范围','string',''],['任务状态','string',''],['任务创建时间','datetime',''],['任务开始时间','datetime','可选'],['任务结束时间','datetime','可选'],['备份大小','bigint','可选'],['校验结果','boolean','可选'],['失败原因','string','可选']],
  '操作日志': [['操作日志标识','bigint','主标识'],['操作时间','datetime',''],['操作模块','string',''],['操作类型','string',''],['操作对象类型','string','可选'],['操作对象标识','bigint','可选'],['操作结果','string',''],['操作说明','string','可选'],['操作来源地址','string','可选']]
};

const virtual = {
  '用户角色': [['用户角色关系标识','bigint','主标识'],['授权开始时间','datetime',''],['授权结束时间','datetime','可选'],['授权操作时间','datetime','']],
  '角色权限': [['角色权限关系标识','bigint','主标识'],['权限授予时间','datetime','']],
  '宿管楼栋管辖': [['管辖关系标识','bigint','主标识'],['管辖开始时间','date',''],['管辖结束时间','date','可选']],
  '住宿分配': [['住宿分配标识','bigint','主标识'],['入住日期','date',''],['退宿日期','date','可选'],['住宿关系状态','string',''],['调整原因','string','']],
  '故障工种配置': [['故障工种配置标识','bigint','主标识'],['配置生效时间','datetime',''],['故障工种配置状态','boolean','']],
  '维修人员工种资质': [['工种资质关系标识','bigint','主标识'],['资质等级','string',''],['资质开始日期','date',''],['资质结束日期','date','可选']],
  '维修人员楼栋范围': [['维修范围关系标识','bigint','主标识'],['负责开始日期','date',''],['负责结束日期','date','可选']],
  '报修工单提交版本': [['报修版本标识','bigint','主标识'],['报修版本序号','bigint',''],['故障描述','string',''],['学生备注','string','可选'],['报修版本提交时间','datetime','可选'],['报修版本状态','string','']],
  '报修审核记录': [['报修审核记录标识','bigint','主标识'],['报修审核结论','string',''],['报修审核原因','string','可选'],['报修审核时间','datetime',''],['报修审核环节','string','']],
  '派单记录': [['派单记录标识','bigint','主标识'],['派单方式','string',''],['派单状态','string',''],['拒单原因','string','可选'],['派单时间','datetime',''],['接单时间','datetime','可选'],['超时判定时间','datetime','可选']],
  '维修延期申请': [['维修延期申请标识','bigint','主标识'],['延期原因','string',''],['预计完成时间','datetime',''],['延期审核结论','string',''],['延期审核原因','string','可选'],['延期审核时间','datetime','可选']],
  '维修确认记录': [['维修确认记录标识','bigint','主标识'],['确认方式','string',''],['确认时间','datetime',''],['确认意见','string','可选']],
  '工单异常记录': [['工单异常记录标识','bigint','主标识'],['异常类型','string',''],['异常说明','string',''],['异常发生时间','datetime','']],
  '留宿批次楼栋规则': [['批次楼栋规则标识','bigint','主标识'],['申请截止时间','datetime',''],['是否自动锁定','boolean',''],['重新提交截止时间','datetime','可选'],['楼栋申请说明','string','可选'],['发布规则时间','datetime',''],['批次楼栋规则状态','string','']],
  '留宿申请提交版本': [['留宿版本标识','bigint','主标识'],['留宿版本序号','bigint',''],['申请说明','string','可选'],['留宿版本提交时间','datetime','可选'],['留宿版本状态','string','']],
  '留宿日期段': [['留宿日期段标识','bigint','主标识'],['留宿开始日期','date',''],['留宿结束日期','date','']],
  '留宿审核记录': [['留宿审核记录标识','bigint','主标识'],['留宿审核结论','string',''],['留宿审核原因','string','可选'],['留宿审核时间','datetime',''],['审核轮次','bigint','']],
  '消息目标': [['消息目标标识','bigint','主标识'],['目标类型','string',''],['目标说明','string','可选']],
  '消息接收记录': [['消息接收记录标识','bigint','主标识'],['是否已读','boolean',''],['读取时间','datetime','可选']],
  '导入错误明细': [['导入错误明细标识','bigint','主标识'],['文件行号','bigint',''],['错误字段名称','string',''],['错误原因','string','']]
};

const relations = [
  ['用户账号','用户角色','授权','1','N','M:N'],['角色','用户角色','分配','1','N','M:N'],
  ['角色','角色权限','授予','1','N','M:N'],['权限','角色权限','配置','1','N','M:N'],
  ['用户账号','学生资料','对应','1','0..1','1:0..1'],['用户账号','宿管资料','对应','1','0..1','1:0..1'],['用户账号','维修人员资料','对应','1','0..1','1:0..1'],
  ['宿管资料','宿管楼栋管辖','管辖','1','N','M:N'],['楼栋','宿管楼栋管辖','被管辖','1','N','M:N'],
  ['楼栋','宿舍','包含','1','N','1:N'],['宿舍','床位','包含','1','N','1:N'],['学生资料','住宿分配','住宿','1','N','M:N'],['床位','住宿分配','分配','1','N','M:N'],
  ['故障分类','故障工种配置','匹配','1','N','M:N'],['维修工种','故障工种配置','需要','1','N','M:N'],['维修人员资料','维修人员工种资质','具备','1','N','M:N'],['维修工种','维修人员工种资质','对应','1','N','M:N'],['维修人员资料','维修人员楼栋范围','负责','1','N','M:N'],['楼栋','维修人员楼栋范围','范围','1','N','M:N'],
  ['学生资料','报修工单','提交','1','N','1:N'],['宿舍','报修工单','发生于','1','N','1:N'],['故障分类','报修工单','归属','1','N','1:N'],['维修工种','报修工单','要求','1','N','1:N'],['报修规则','报修工单','适用','1','N','1:N'],
  ['报修工单','报修工单提交版本','形成','1','N','1:N'],['报修工单提交版本','报修审核记录','被审核','1','N','1:N'],['报修工单','派单记录','产生','1','N','1:N'],['维修人员资料','派单记录','接收','1','N','1:N'],['报修工单','维修延期申请','产生','1','N','1:N'],['报修工单','维修结果','产生','1','0..1','1:0..1'],['维修结果','维修确认记录','确认','1','0..1','1:0..1'],['维修确认记录','维修评价','产生','1','0..1','1:0..1'],['报修工单','工单异常记录','产生','1','N','1:N'],
  ['留宿批次','留宿批次楼栋规则','配置','1','N','1:N'],['楼栋','留宿批次楼栋规则','适用','1','N','1:N'],['留宿批次楼栋规则','留宿申请','接收','1','N','1:N'],['学生资料','留宿申请','提交','1','N','1:N'],['留宿申请','留宿申请提交版本','形成','1','N','1:N'],['留宿申请提交版本','留宿日期段','包含','1','N','1:N'],['留宿申请提交版本','留宿审核记录','被审核','1','N','1:N'],
  ['站内消息','消息目标','设置','1','N','1:N'],['站内消息','消息接收记录','生成','1','N','1:N'],['用户账号','消息接收记录','接收','1','N','1:N'],['角色','消息目标','目标','1','N','1:N'],['楼栋','消息目标','目标','1','N','1:N'],['用户账号','消息目标','目标','1','N','1:N'],
  ['用户账号','登录日志','产生','1','N','1:N'],['用户账号','导入导出任务','发起','1','N','1:N'],['导入导出任务','导入错误明细','产生','1','N','1:N'],['用户账号','备份任务','发起','1','N','1:N'],['用户账号','操作日志','产生','1','N','1:N'],
  ['报修工单提交版本','文件资源','关联图片','1','N','1:N'],['维修延期申请','文件资源','关联照片','1','N','1:N'],['维修结果','文件资源','关联照片','1','N','1:N'],['站内消息','文件资源','关联附件','1','N','1:N'],['导入导出任务','文件资源','关联文件','1','N','1:N'],['备份任务','文件资源','产生文件','1','N','1:N'],
  ['报修工单','报修工单','原工单/重修','1','N','1:N']
];

const groups = {
  '账号权限':['用户账号','角色','权限','学生资料','宿管资料','维修人员资料','用户角色','角色权限','宿管楼栋管辖'],
  '住宿基础':['楼栋','宿舍','床位','住宿分配'],
  '报修业务':['故障分类','维修工种','报修规则','报修工单','维修结果','维修评价','维修工单提交版本','报修审核记录','派单记录','维修延期申请','维修确认记录','工单异常记录','故障工种配置','维修人员工种资质','维修人员楼栋范围'],
  '假期留宿':['留宿批次','留宿申请','留宿批次楼栋规则','留宿申请提交版本','留宿日期段','留宿审核记录'],
  '消息与系统通用':['站内消息','消息目标','消息接收记录','文件资源','登录日志','导入导出任务','导入错误明细','备份任务','操作日志']
};

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function id(prefix='c') { return `${prefix}${nextId++}`; }
function cell(attrs) { return `<mxCell ${attrs}/>`; }
function vertex(value, x, y, w, h, style, parent='1') { const i=id('v'); return `<mxCell id="${i}" parent="${parent}" value="${esc(value)}" vertex="1" style="${style}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`; }
function edge(source, target, label, style, parent='1') { const i=id('e'); return `<mxCell id="${i}" parent="${parent}" source="${source}" target="${target}" value="${esc(label)}" edge="1" style="${style}"><mxGeometry relative="1" as="geometry"/></mxCell>`; }
function note(text,x,y,w=360,h=60){ return vertex(text,x,y,w,h,'shape=note;whiteSpace=wrap;html=1;fillColor=#fff7d6;strokeColor=#d6b656;fontSize=12;'); }
function title(text, subtitle='') { const content = subtitle ? `${text}<br/><font style="font-size:12px" color="#5b6472">${subtitle}</font>` : text; return `<mxCell id="${id('t')}" parent="1" value="${esc(content)}" vertex="1" style="text;html=1;align=left;verticalAlign=middle;fontSize=22;fontStyle=1;fontColor=#16324f;"><mxGeometry x="40" y="20" width="1800" height="45" as="geometry"/></mxCell>`; }
function model(cells, w=2200, h=1500) { return `<mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${w}" pageHeight="${h}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join('')}</root></mxGraphModel>`; }
function entityStyle(isVirtual=false, compact=false) { return `rounded=0;whiteSpace=wrap;html=1;fillColor=${isVirtual?'#f7f8fa':'#ffffff'};strokeColor=${isVirtual?'#52606d':'#16324f'};strokeWidth=2;${isVirtual?'dashed=1;dashPattern=8 8;':''}fontStyle=1;fontSize=${compact?12:14};align=center;verticalAlign=middle;`; }
function attrStyle(isPk=false) { return `shape=ellipse;whiteSpace=wrap;html=1;fillColor=${isPk?'#e8f1fb':'#f8fafc'};strokeColor=${isPk?'#2b6cb0':'#8793a1'};strokeWidth=1;${isPk?'fontStyle=4;':''}fontSize=11;align=center;verticalAlign=middle;`; }
const relStyle = 'shape=rhombus;whiteSpace=wrap;html=1;fillColor=#fff4ce;strokeColor=#b7791f;strokeWidth=1;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;';
const lineStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#52606d;strokeWidth=1;endArrow=none;startArrow=none;';
const dashedLineStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#9aa5b1;dashed=1;dashPattern=4 4;endArrow=none;startArrow=none;';
function addEntity(cells, name, x, y, compact=false) { const isV=!!virtual[name]; const attrs = isV ? virtual[name] : independent[name]; const i=id('ent'); const h=compact?46:Math.max(54, 28+attrs.length*18); const content = isV ? `${name}<br/><font style="font-size:10px" color="#52606d">虚实体</font>` : name; cells.push(`<mxCell id="${i}" parent="1" value="${esc(content)}" vertex="1" style="${entityStyle(isV,compact)}"><mxGeometry x="${x}" y="${y}" width="${compact?160:220}" height="${h}" as="geometry"/></mxCell>`); return {id:i,x,y,w:compact?160:220,h}; }
 function addAttributes(cells, ent, name, centerX, centerY) { const attrs=independent[name]||virtual[name]||[]; const radiusX=390, radiusY=260; attrs.forEach((a,idx)=>{ const angle=-Math.PI/2 + (2*Math.PI*idx/Math.max(attrs.length,1)); const x=centerX+radiusX*Math.cos(angle)-75; const y=centerY+radiusY*Math.sin(angle)-24; const ai=id('a'); const label=`${a[0]}<br/><font color="#52606d">${a[1]}${a[2]?` · ${a[2]}`:''}</font>`; cells.push(`<mxCell id="${ai}" parent="1" value="${esc(label)}" vertex="1" style="${attrStyle(a[2]==='主标识')}"><mxGeometry x="${x}" y="${y}" width="150" height="48" as="geometry"/></mxCell>`); cells.push(edge(ent.id,ai,'','edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#b8c2cc;dashed=1;endArrow=none;startArrow=none;')); }); }
 function addRel(cells, a, b, label, cardA, cardB, x, y, original='') { const ri=id('rel'); const originalText = original && original !== `${cardA}:${cardB}` ? `<br/><font color="#8a5a00">原联系 ${original}</font>` : ''; const content = `${label}${originalText}`; cells.push(`<mxCell id="${ri}" parent="1" value="${esc(content)}" vertex="1" style="${relStyle}"><mxGeometry x="${x}" y="${y}" width="150" height="${originalText ? 72 : 58}" as="geometry"/></mxCell>`); cells.push(edge(a.id,ri,cardA,`${lineStyle}fontStyle=1;`)); cells.push(edge(ri,b.id,cardB,`${lineStyle}fontStyle=1;`)); return ri; }
function addCardLabel(cells,text,x,y){ /* cardinality is rendered on each relationship edge */ }
function addRelationPair(cells, a, b, label, ca, cb, relX, relY, original='') { addRel(cells,a,b,label,ca,cb,relX,relY,original); }
function addLegend(cells,x=40,y=1380){ cells.push(vertex('图例：实线方框=独立实体　虚线方框=虚实体　菱形=联系　椭圆=属性　椭圆下划线=主标识　联系两端数字表示基数',x,y,1900,36,'text;html=1;align=left;verticalAlign=middle;fontSize=12;fontColor=#52606d;')); }
function relationForEntity(name) { return relations.filter(r=>r[0]===name||r[1]===name); }
function domainPage(domain, names) { const cells=[title(`${domain} ER 图`, '独立实体为实线方框，虚实体为虚线方框；联系为菱形；两端基数直接标在线上')]; const positions={}; const cols=3; names.forEach((n,idx)=>{const col=idx%cols,row=Math.floor(idx/cols); positions[n]=addEntity(cells,n,80+col*670,130+row*240,true);}); let relIdx=0; names.forEach(n=>{relationForEntity(n).forEach(r=>{if(!names.includes(r[0])||!names.includes(r[1])||r[0]>r[1]) return; const a=positions[r[0]],b=positions[r[1]]; const x=(a.x+b.x)/2+55,y=(a.y+b.y)/2+35+(relIdx%2)*65; addRelationPair(cells,a,b,r[2],r[3],r[4],x,y,r[5]); relIdx++;});}); addLegend(cells); return model(cells,2200,1500); }
 function totalPage() { const cells=[title('宿舍系统总 ER 图', '完整实体、虚实体与联系总览；详细属性见各实体页面，分域联系见各业务域页面')]; const positions={}; const groupY={'账号权限':120,'住宿基础':430,'报修业务':700,'假期留宿':1010,'消息与系统通用':1260}; const groupX=60; Object.entries(groups).forEach(([g,names])=>{ cells.push(vertex(g,groupX,groupY[g]-38,300,28,'text;html=1;align=left;verticalAlign=middle;fontSize=16;fontStyle=1;fontColor=#16324f;')); names.forEach((n,idx)=>{ const col=idx%5,row=Math.floor(idx/5); positions[n]=addEntity(cells,n,groupX+col*330,groupY[g]+row*82,true); }); }); const selected=relations.filter((r,i)=>i<relations.length); selected.forEach((r,i)=>{const a=positions[r[0]],b=positions[r[1]]; if(!a||!b)return; const x=Math.min(a.x,b.x)+(Math.abs(a.x-b.x)>300?100:190); const y=(a.y+b.y)/2+25+(i%3)*16; const ri=id('rel'); const content=`${r[2]}<br/><font color="#8a5a00">${r[3]}:${r[4]}</font>`; cells.push(`<mxCell id="${ri}" parent="1" value="${esc(content)}" vertex="1" style="${relStyle}fontSize=9;"><mxGeometry x="${x}" y="${y}" width="100" height="45" as="geometry"/></mxCell>`); cells.push(edge(a.id,ri,'',lineStyle)); cells.push(edge(ri,b.id,'',lineStyle)); addCardLabel(cells,r[3],x-34,y+10); addCardLabel(cells,r[4],x+106,y+10); }); addLegend(cells,60,1540); return model(cells,2400,1650); }
function entityPage(name) { const cells=[title(`${name} 单个实体 ER 图`, '实体/虚实体与属性、直接联系；主标识属性使用下划线')]; const ent=addEntity(cells,name,900,610,false); addAttributes(cells,ent,name,1010,650); const rs=relationForEntity(name).slice(0,8); rs.forEach((r,idx)=>{ const other=r[0]===name?r[1]:r[0]; const otherNode=addEntity(cells,other,120+(idx%4)*470,140+Math.floor(idx/4)*250,true); const nameIsA=r[0]===name; const ca=nameIsA?r[3]:r[4], cb=nameIsA?r[4]:r[3]; addRelationPair(cells,ent,otherNode,r[2],ca,cb,560+(idx%4)*70,340+Math.floor(idx/4)*230); }); if(rs.length===0) cells.push(note('该实体当前没有在总联系表中登记的直接联系。',760,170,500,70)); addLegend(cells); return model(cells,2200,1500); }
function page(name, xml) { const did=id('d'); return `<diagram id="${did}" name="${esc(name)}">${xml}</diagram>`; }

const pages=[];
pages.push(page('总ER图',totalPage()));
for (const [g,names] of Object.entries(groups)) pages.push(page(`${g} ER图`,domainPage(g,names)));
for (const n of Object.keys(independent)) pages.push(page(`${n} 单个ER图`,entityPage(n)));
for (const n of Object.keys(virtual)) pages.push(page(`${n} 单个ER图`,entityPage(n)));
const doc=`<mxfile host="app.diagrams.net" modified="2026-10-13T12:00:00.000Z" agent="Codex" version="24.7.17" type="device">${pages.join('')}</mxfile>`;
fs.mkdirSync(path.dirname(outFile), {recursive:true});
fs.writeFileSync(outFile, doc, 'utf8');
console.log(`Generated ${outFile} with ${pages.length} pages.`);
