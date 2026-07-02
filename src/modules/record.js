function isSensitiveElement(el) {
    if (!el || !el.tagName) return false
    const tag = el.tagName.toLowerCase()
    if (tag !== 'input' && tag !== 'textarea') return false
    const type = (el.getAttribute('type') || '').toLowerCase()
    if (type === 'password') return true
    const identifier = (el.getAttribute('name') || el.getAttribute('id') || '').toLowerCase()
    const patterns = ['password', 'phone', 'tel', 'mobile', 'credit', 'card', 'secret', 'token']
    return patterns.some(p => identifier.includes(p))

}
export function initRecord(bus) {
    let _nodeId = 0
    function getNodeId(node) {
        if (!node.dataset) return null
        if (!node.dataset._mid) {
            node.dataset._mid = String(++_nodeId)
        }
        return node.dataset._mid
    }
    function snapshot(root = document.documentElement) {
        const id = getNodeId(root)
        if (id === null) return null
        const node = {
            id,
            tag: root.tagName?.toLowerCase(),
            children: []
        }
        if (root.attributes) {
            node.attrs = {}
            for (const attr of root.attributes) {
                if (attr.name === 'data-_mid') continue
                if (isSensitiveElement(root) && (attr.name === 'value' || attr.name === 'placeholder')) continue
                node.attrs[attr.name] = attr.value
            }
        }
        for (const child of root.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childNode = snapshot(child)
                if (childNode) node.children.push(childNode)
            } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                node.children.push({ text: child.textContent.trim() })
            }
        }
        return node
    }
    const events = []
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'childList') {
                const parentId = getNodeId(m.target)
                for (const node of m.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        events.push({
                            type: 'add',
                            parentId,
                            node: snapshot(node),
                            timestamp: Date.now()
                        })
                    }
                }
                for (const node of m.removedNodes) {
                    const removedId = getNodeId(node)
                    if (removedId) {
                        events.push({
                            type: 'remove',
                            parentId,
                            nodeId: removedId,
                            timestamp: Date.now()
                        })
                    }
                }

            }
            else if (m.type === 'attributes') {
                const targetId = getNodeId(m.target)
                if (targetId && m.attributeName !== 'data-_mid' && !isSensitiveElement(m.target)) {
                    events.push({
                        type: 'attr',
                        nodeId: targetId,
                        attr: m.attributeName,
                        value: m.target.getAttribute(m.attributeName),
                        timestamp: Date.now()
                    })
                }
            }
            else if (m.type === 'characterData') {
                const parentEl = m.target.parentElement
                const parentId = getNodeId(parentEl)
                if (parentId) {
                    events.push({
                        type: 'text',
                        nodeId: parentId,
                        text: m.target.textContent,
                        timestamp: Date.now()
                    })
                }
            }

        }
    })

    observer.observe(document.documentElement, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
    })
    const fullSnapshot = snapshot()
    return {
        getSnapshot() {
            return fullSnapshot
        },
        getEvents() {
            return [...events]
        }
    }



}
