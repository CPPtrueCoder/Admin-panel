import "../../helpers/iframeLoader.js"

import axios from 'axios'
import React, {Component} from "react"

export default class Editor extends Component {
	
	constructor() {
		super ();
		this.currentPage = "index.html";
		this.state = {
			pageList: [],
			newPageName: ""
		};
		this.createNewPage = this.createNewPage.bind (this);
	}
	
	componentDidMount() {
		this.init (this.currentPage);
	}
	
	init(page) {
		this.iframe = document.querySelector ('iframe');
		this.open (page);
		this.loadPageList ();
	}
	
	parseStrToDOM(str) {
		const parser = new DOMParser ();
		return parser.parseFromString (str, "text/html");
	}
	
	open(page) {
		this.currentPage = `../${page}`;
		axios.get (`../${page}`).then (res =>  this.parseStrToDOM (res.data))
		.then(this.wrapTextNodes)
			.then(dom=>{
				this.virtualDom=dom;
				return dom;
			})
			.then(this.serializeDOMtoStr)
			.then(html=>axios.post("./api/saveTempPage.php",{html}))
			.then(()=>this.iframe.load("../temp.html"))
			.then(()=>this.enableEditing())
		// this.iframe.load (this.currentPage, () => {
		//
		// });
	}
	enableEditing(){
		this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach(element=>{
			element.contentEditable = "true";
			element.addEventListener("input",()=>{
				this.onTextEdit(element);
			})
		})
	}
	
	onTextEdit(element){
		const id =element.getAttribute("nodeid");
		this.virtualDom.body.querySelector(`[nodeid=""${id}]`).innerHTML=element.innerHTML;
		
	}
	loadPageList() {
		axios
			.get ("./api").then (res => this.setState ({pageList: res.data}))
	}
	
	createNewPage() {
		axios.post ("./api/createNewPage.php", {"name": this.state.newPageName})
			.then (this.loadPageList ())
			.catch (() => alert ("Страница уже существует"));
	}
	
	deletePage(page) {
		axios.post ("./api/deletePage.php", {"name": page})
			.then (this.loadPageList ())
			.catch (() => alert ("page not found"));
	}
	
	wrapTextNodes(dom) {
		const body = dom.body;
		let textNodes = [];
		
		function recursy(element) {
			element.childNodes.forEach (node => {
				
				if (node.nodeName === "#text" && node.nodeValue.replace (/\s+/g, "").length > 0) {
					
					textNodes.push (node);
				}
				else {
					recursy (node);
				}
			})
		}
		
		recursy (body);
		textNodes.forEach ((node,i) => {
			const wrapper = dom.createElement ('text-editor');
			node.parentNode.replaceChild (wrapper, node);
			wrapper.appendChild (node);
			wrapper.setAttribute("nodeid",i);
			
		});
		return dom;
	}
	serializeDOMtoStr(dom){
		const serializer = new XMLSerializer();
		
		return  serializer.serializeToString(dom);
	}
	render() {
		// const {pageList} = this.state;
		// const pages = pageList.map ((page, i) => {
		// 	return (<h1 key={i}>{page}
		// 		<a
		// 		   href="#"
		// 		   onClick={()=>this.deletePage(page)}>(X)</a>
		// 	</h1>)
		// });
		return (
			<iframe src={this.currentPage} frameBorder="0"></iframe>
			// <>
			// 	<input
			// 		onChange={(e) => {this.setState ({newPageName: e.target.value})}}
			// 		type="text"/>
			// 	<button onClick={this.createNewPage}>Create Page</button>
			// 	{pages}
			// </>
		)
	}
}