export const convertToTreeViewFormat = (backendTree) => {
  // ১. একদম শুরুতে একটি মাত্র রুট ডিফাইন করা হলো
  const flatData = [
    {
      id: "root",
      name: "Organization Root",
      children: [], // এখানে টপ লেভেল এমপ্লয়িদের আইডি জমা হবে
    },
  ];

  const traverse = (node, parentId) => {
    const currentId = node.idNo;
    
    const treeNode = {
      id: currentId,
      name: node.name,
      metadata: { role: node.role, email: node.email, photo: node.photo },
      children: [],
    };

    flatData.push(treeNode);

    // প্যারেন্টের children অ্যারেতে বর্তমান আইডি পুশ করা
    const parent = flatData.find((n) => n.id === parentId);
    if (parent) {
      parent.children.push(currentId);
    }

    // নিচের চাইল্ড থাকলে সেগুলোর জন্য আবার রান করা
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => traverse(child, currentId));
    }
  };

  // ২. প্রত্যেকটি রুট নোডকে "root" এর চাইল্ড হিসেবে ট্রাভার্স করা হচ্ছে
  backendTree.forEach((rootNode) => {
    traverse(rootNode, "root");
  });

  return flatData;
};
