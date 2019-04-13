// Get required packages
const saidit = require('redditor');
const { shell } = require("electron");
const markdown = new Remarkable({
	linkify: true,
	html: false
});

var username, password, saiditSession, content = document.getElementById("content");

// Initialize parser (Removes useless data)
var parse = {
    t1: json => { return {
            children: parse["ListingComments"](json.replies.data),
            username: json.author,
            score: json.score,
            archived: json.archived,
            content: json.body,
            contentHTML: json.body_html,
            edited: json.edited,
            stickied: json.stickied,
            created: {
                normal: json.created,
                utc: json.created_utc
        	},
			fullname: json.name,
			type: "t1"
        }
    },
    t2: json => { return {
            username: json.name,
            karma: {
                comment: json.comment_karma,
                submission: json.link_karma,
                total: json.comment_karma + json.link_karma
            },
            over18: json.over_18,
            employee: json.is_employee,
            isMod: json.is_mod,
            isFriend: json.is_friend,
            isSuspened: json.is_suspended,
            modhash: json.modhash,
            hasUnreadMail: json.has_mail,
            hasUnreadModMail: json.has_mod_mail,
            unreadMessages: json.inbox_count,
            verifiedEmail: json.has_verified_email,
            hideFromRobots: json.hide_from_robots,
            created: {
                normal: json.created,
                utc: json.created_utc
            }
        }
    },
    t3: json => {

	},
	t4: json => { return {
			banner: json.banner_img === "" ? "none" : json.banner_img,
			banned: json.user_is_banned,
			wikiEnabled: json.wiki_enabled,
			submitText: {
				normal: json.submit_text,
				html: json.submit_text_html
			},
			description: {
				public: {
					normal: json.public_description,
					html: json.public_description_html
				},
				normal: {
					normal: json.description,
					html: json.description_html
				}
			},
			title: json.title,
			online: json.accounts_active,
			subscribers: json.subscribers,
			fullname: json.name,
			created: {
				normal: json.created,
				utc: json.created_utc
			},
			moderator: json.user_is_moderator,
			type: json.subreddit_type,
			subscribed: json.user_is_subscriber
		}
	},
	t5: json => { return {
            sub: json.subreddit,
            selftext: {
                normal: json.selftext,
                html: json.selftext_html
            },
            suggestedSort: json.suggested_sort,
            reports: json.user_reports,
            saved: json.saved,
            id: json.id,
            clicked: json.clicked,
            reportReasons: json.report_reasons,
            domain: json.domain,
            hidden: json.hidden,
            thumbnail: json.thumbnail == "self" ? "textpost" : json.thumbnail,
            edited: json.edited,
            archived: json.archived,
            hideScore: json.hide_score,
            permalink: json.permalink,
            locked: json.locked,
            created: {
                normal: json.created,
                utc: json.created_utc
            },
            url: json.url,
            quarantine: json.quarantine,
            title: json.title,
            comments: json.num_comments,
            visited: json.visited,
            poster: json.author,
			fullname: json.name,
			score: json.score,
			type: "t5"
        }
    },
    t6: json => {

    },
    t7: json => {

    },
    t8: json => {

    },
    t9: json => {

    },
    "ListingPosts": json => {
        let posts = []
        json.children.forEach(post => posts.push(parse.t5(post.data)))
        return posts
    },
    "ListingComments": json => {
        if (json === undefined) return []
        let comments = []
        json.children.forEach(comment => comments.push(parse.t1(comment.data)))
        return comments
	},
	"ListingUser": json => {
		let toReturn = []
		json.children.forEach(data => toReturn.push(parse[data.kind](data.data)))
		return toReturn
	}
}

// Get username & password
function login() {
	username = document.getElementById("username").value
	password = document.getElementById("password").value
	normalStuff()
}

// npm's redditor repurposed for SaidIt
function normalStuff() {
    saidit({
        username: username,
        password: password
    }, (err, authorized) => {
        // Note that the returned object and the main reddit instance are not the same

        if (err) {
            alert("Incorrect password or username.");
		} else {
			view("main")

            saiditSession = authorized

            authorized.get('/api/me.json', (err, response) => {
                let data = parse.t2(response.data)
				document.getElementById("user-info").innerHTML +=
					"<span id='user-info'>" +
					"<span id='user-name' onclick='loadUser(`" + data.username + "`)'>" + isAdmin(data.username) + "</span> " +
                    "<span id='user-karma'>(<span id='user-comment-karma'>" + data.karma.comment + "</span>|" +
					"<span id='user-submission-karma'>" + data.karma.submission + "</span>)</span>" +
					"</span>"
            })

            loadSub("home")
        }
    });
}

function loadSub(sub) {
	view("main")
	saiditSession.get((sub.startsWith("/s/") ? "" : "/s/") + sub + ".json", (err, response) => {
		let posts, about;
		try {
			posts = parse["ListingPosts"](response.data)
		} catch (e) {
			alert("ERROR: " + e)
		}

		content.innerHTML = ""

		saiditSession.get((sub.startsWith("/s/") ? "" : "/s/") + sub + "/about.json", (err, response) => {
			if (!err) about = parse.t4(response.data)

			try {
				content.innerHTML += `<h1>${(sub.startsWith("/s/") ? "" : "/s/") + sub}</h1>
				${sub !== "home" && sub !== "all" && sub !== "subscribed" ? `<i>${markdown.render(about.description.normal.normal)}</i>` : ``}
				${sub !== "home" && sub !== "all" && sub !== "subscribed" ? "<h3 onclick='view(\"textpost\")'>Make text post</h3>" : ""}
				<div class="content-sub-about">
					<span class="content-sub-about-description">Title: ${about.title}</span> | 
					<span class="content-sub-about-online">~${about.online} People here right now</span> | 
					<span class="content-sub-about-subscribers">${about.subscribers} Subscribers</span>
				</div>`
			} catch (e) {
				content.innerHTML += `<h1>${(sub.startsWith("/s/") ? "" : "/s/") + sub}</h1>` // Don't load stuff if sub is auto-generated
			}
			
			try {
				posts.forEach(data => {
					content.innerHTML +=
						"<div class='content-post'>" +
						"<h3 class='content-post-title' onclick='loadPost(`" + data.permalink + "`)'>" + data.title + "</h3>" +
						"<span oncontextmenu='voteInsightful(`" + data.fullname + "`)' class='noMargin'> [I] </span>" +
						"<span oncontextmenu='voteFun(`" + data.fullname + "`)' class='noMargin'> [F] </span>" +
						`<span class='content-post-score'>${data.score}</span> | ` +
						"<span class='content-post-sub' onclick='loadSub(this.innerHTML)'>/s/" + data.sub + "</span>" +
						" | " +
						"<span class='content-post-poster' onclick='loadUser(`" + data.poster + "`)'>" + isAdmin(data.poster) + "</span><br>" +
						(
							data.thumbnail === "textpost" ?
								`<p class='content-post-text' onclick='loadPost(${data.permalink})'>${markdown.render(data.selftext.normal)}</p>` :
								(
									data.url.endsWith(".jpg") || data.url.endsWith("png") ?
										`<img src='${data.url}' class='content-post-image' onclick='shell.openExternal("${data.url}")' width='auto' height='auto' align='middle'>` :
										`<img src='${data.thumbnail}' class='content-post-thumbnail' onclick='shell.openExternal("${data.url}")' width='auto' height='auto'>`
								)
						) +
						"</div>"
				})

				aTags = document.getElementsByTagName("a");
				for (var i = 0; i < aTags.length; i++) {
					aTags[i].setAttribute("onclick", "shell.openExternal('" + aTags[i].href + "')");
					aTags[i].href = "#";
				}

			} catch (e) { /* gl making me alert ;) */ }
		})
	})
}

function loadPost(url) {
    saiditSession.get(url + ".json", (err, response) => {
        let comments = parse["ListingComments"](response[1].data)

		let data = parse.t5(response[0].data.children[0].data)
		
		content.innerHTML =
			"<div class='content-post'>" +
			"<h3 class='content-post-title' onclick='loadPost(`" + data.permalink + "`)'>" + data.title + "</h3>" +
			"<span oncontextmenu='voteInsightful(`" + data.fullname + "`)' class='noMargin'> [I] </span>" +
			"<span oncontextmenu='voteFun(`" + data.fullname + "`)' class='noMargin'> [F] </span>" +
			`<span class='content-post-score'>${data.score}</span> | ` +
			"<span class='content-post-sub' onclick='loadSub(this.innerHTML)'>/s/" + data.sub + "</span>" +
			" | " +
			"<span class='content-post-poster' onclick='loadUser(`" + data.poster + "`)'>" + isAdmin(data.poster) + "</span><br>" +
			(
				data.thumbnail === "textpost" ?
					`<p class='content-post-text' onclick='loadPost(${data.permalink})'>${markdown.render(data.selftext.normal)}</p>` :
					(
						data.url.endsWith(".jpg") || data.url.endsWith("png") ?
							`<img src='${data.url}' class='content-post-image' onclick='shell.openExternal("${data.url}")' width='auto' height='auto' align='middle'>` :
							`<img src='${data.thumbnail}' class='content-post-thumbnail' onclick='shell.openExternal("${data.url}")' width='auto' height='auto'>`
					)
			) +
			`</div>
			<textarea id="content-post-reply-textarea"></textarea><br>
			<button onclick="comment('${data.fullname}', document.getElementById('content-post-reply-textarea').value)" id="content-post-reply-btn">Reply</button>`

		content.innerHTML += commentsToHTML(comments)
		
		// https://stackoverflow.com/a/32721675/10637301
		aTags = document.getElementsByTagName("a");
		for (var i = 0; i < aTags.length; i++) {
			aTags[i].setAttribute("onclick", "shell.openExternal('" + aTags[i].href + "')");
			aTags[i].href = "#";
		}
    }) 
}

function commentsToHTML(comments) {
    if (comments === []) return ""
    let html = "";
    comments.forEach(comment => {
        html += "<details open>"
        html += "<summary>"
        html += "<span oncontextmenu='voteInsightful(`" + comment.fullname + "`)' class='noMargin'> [I] </span>"
		html += "<span oncontextmenu='voteFun(`" + comment.fullname + "`)' class='noMargin'> [F] </span>"
		html += "<span oncontextmenu='expandReply(this, `" + comment.fullname + "`)' class='noMargin'> [R] </span>"
        html += comment.score
        html += " | "
		html += "<span onclick='loadUser(`" + comment.username + "`)' class='content-comment-username'>" + isAdmin(comment.username) + "</span>"
        html += markdown.render(comment.content)
        html += "</summary>"
        html += commentsToHTML(comment.children)
        html += "</details>"
    })

    return html
}

function loadUser(username) {
	saiditSession.get("/u/" + username + ".json", (err, response) => {
		let history = parse.ListingUser(response.data)

		saiditSession.get("/u/" + username + "/about.json", (err, response) => {
			let about = parse.t2(response.data)

			content.innerHTML = ""

			content.innerHTML += `<h2 class="content-user-username" onclick="loadUser('${about.username}')">${about.username}</h2>
			<p class="content-user-karma">(
				<span class="content-user-karma-link">${about.karma.submission}</span> |
				<span class="content-user-karma-comment">${about.karma.comment}</span>
			)</p>`

			content.innerHTML += parseUserHistory(history)
		})
	})
}

function isAdmin(username) {
    let admins = ["magnora7", "d3rr"]
    let devs = ["Yhvr"]
    return (admins.includes(username) ? "[A] " : "") + (devs.includes(username) ? "[C] " : "") + "/u/" + username
}

function voteInsightful(id) {
    saiditSession.post("/api/vote/", { dir:  1, id: id, rank: 1, isTrusted: true, uh: username, renderstyle: "html" }, (err, response) => {
        alert("Voted.")
    })
}

function voteFun(id) {
    saiditSession.post("/api/vote/", { dir: -1, id: id, rank: 1, isTrusted: true, uh: username, renderstyle: "html" }, (err, response) => {
        alert("Voted.")
    })
}

function comment(id, text) {
	saiditSession.post("/api/comment/", { api_type: "json", text: text, thing_id: id, isTrusted: true, uh: username, renderstyle: "html" }, (err, response) => {
		alert("Commented.")
	})
}

function textpost() {
	saiditSession.post("/api/submit/", { api_type: "json", kind: "self", resubmit: true, sendreplies: true, sr: document.getElementById("makepost-text-sub").value, text: document.getElementById("makepost-text-text").value, title: document.getElementById("makepost-text-title").value, isTrusted: true, uh: username, renderstyle: "html" }, (err, response) => {
		alert("Posted.")
		view("main")
	})
}

function parseUserHistory(history) {
	let html = ``
	html += `<div class='content-user-history'>`
	history.forEach(data => {
		if (data.type === "t1") {
			html += `<div class="content-user-history-comment">
				<span class="content-user-history-comment-score">${data.score}</span> | 
				<span class="content-user-history-comment-username">${data.username}</span>
				<p class="content-user-history-comment-text">${markdown.render(data.content)}</p>
			</div>`
		} else if (data.type === "t5") {
			if (data.thumbnail === "textpost") {
				// Textpost
				html += `<div class="content-user-history-post">
					<span class="content-user-history-post-score">${data.score}</span> | 
					<span class="content-user-history-post-username">${data.username}</span>
					<span class="content-user-history-post-sub">/s/${data.sub}</span>
					<p class="content-user-history-post-text">${markdown.render(data.selftext.normal)}</p>
				</div>`
			} else {
				// Link/Image, handle image like link
				html += "<div class='content-user-history-post'>" +
					"<h3 class='content-post-title' onclick='loadPost(`" + data.permalink + "`)'>" + data.title + "</h3>" +
					`<span class='content-post-score'>${data.score}</span> | ` +
					"<span class='content-post-sub' onclick='loadSub(this.innerHTML)'>/s/" + data.sub + "</span>" +
					" | " +
					"<span class='content-post-poster'>" + isAdmin(data.poster) + "</span><br>" +
					`<img src='${data.thumbnail}' class='content-post-thumbnail' onclick='shell.openExternal("${data.url}")' width='auto' height='auto'>` +
				"</div>"
			}
		}
	})
	html += `</div>`
	return html
}

function view(id) {
	let views = ["login", "main", "about", "textpost"]
	views.forEach(thisid => document.getElementById(thisid).style.display = "none")
	document.getElementById(id).style.display = "block"
}

function expandReply(element, fullname) {
	element.parentElement.innerHTML += `<div class='content-comment-reply'>
		<textarea class='content-comment-reply-textarea'></textarea><br>
		<button onclick='comment("${fullname}", this.previousElementSibling.value)'>Reply</button>
		<button onclick='this.parentElement.innerHTML = ""'>Close</button>
	</div>`
}